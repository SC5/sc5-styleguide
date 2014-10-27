/***
*
* styleguide.js
*
* Parses CSS/LESS/SASS files with KSS notation and generates a styleguide
*
* Heavily influenced by node-kss and gulp-kss projects
*
***/

'use strict';
var through = require('through2'),
  kss = require('kss'),
  sanitizeHtml = require('sanitize-html'),
  fs = require('fs'),
  ncp = require('ncp'),
  vfs = require('vinyl-fs'),
  gulp = require('gulp'),
  sass = require('gulp-sass'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  es = require('event-stream'),
  chalk = require('chalk'),
  marked = require('gulp-marked'),
  rename = require('gulp-rename'),
  mkdirp = require('mkdirp'),
  mustache = require('gulp-mustache'),
  parser = require(__dirname + '/parser')(),
  path = require('path'),
  sgServer = require(__dirname + '/server'),
  File = require('vinyl'),
  distPath = __dirname + '/dist',
  callbackCount;

module.exports = function(opt) {
  if (!opt) opt = {};

  var filesConfig = opt.filesConfig;

  opt = {
    title: opt.title || 'Styleguide Generator',
    sass: opt.sass || {},
    overviewPath: opt.overviewPath || __dirname + '/overview.md',
    extraHead: opt.extraHead || '',
    appRoot: opt.appRoot || '',
    commonClass: opt.commonClass || '',
    sassVariables: opt.sassVariables || '',
    socketIo: opt.socketIo || false
  };

  if (typeof opt.extraHead === 'object') opt.extraHead = opt.extraHead.join('\n');
  if (!opt.kssOpt) opt.kssOpt = {};

  // Files object acts as our buffer
  var filesBuffer = {};

  // A stream through which each file will pass
  // We have 4 different streams that we have to wait until the whole process is completed
  callbackCount = 4;

  var checkIfDone = function(callback) {
    if (--callbackCount <= 0) {
      callback();
    }
  }

  return through(
    {
      objectMode: true,
      allowHalfOpen: false
    },
    // Buffer all filenames
    function(file, enc, cb) {
      if (file.isNull()) return;
      if (file.isStream()) {
        return console.error('Styleguide does not support streams!');
      }

      filesBuffer[file.path] = file.contents.toString('utf8');

      // Make sure file goes through the next gulp plugin
      this.push(file);

      // We're done with this file!
      cb();
    },
    // After reading all files, parse them and generate data for styleguide
    function(callback) {
      var _this = this;
      parseKssMarkup(filesBuffer, opt.kssOpt, function(styleguide) {
        var pushAllFiles = function() {
          return through.obj(function(file, enc, cb) {
            _this.push(file);
            cb();
          }).on('finish', function() {
            checkIfDone(callback);
          })
        };

        // Store settings inside the styleguide JSON
        styleguide.config = opt;

        // Do not add output path to configuration
        delete styleguide.config.outputPath

        // If settings file is found, generate settings object
        if (opt.sassVariables) {
          var syntax = path.extname(opt.sassVariables).substring(1);
          styleguide.config.settings = parser.parseVariables(fs.readFileSync(opt.sassVariables, 'utf-8'), syntax);
        }

        // Create JSON containing KSS data
        _this.push(new File({
          path: 'styleguide.json',
          contents: new Buffer(JSON.stringify(styleguide))
        }));

        // Process markdown file
        if (opt.overviewPath) {
          getMarkdownStream(opt.overviewPath)
            .pipe(rename(function(path) {
              path.basename = 'overview';
              path.extname = '.html';
            }))
            .pipe(pushAllFiles())
        }

        // Preprocess all CSS files and combile then to a single file
        getPreprocessStream(Object.keys(filesBuffer), opt)
          .pipe(pushAllFiles());

        // Copy all files (except index.html) from dist from to output stream
        gulp.src([distPath + '/**', '!' + distPath + '/index.html'])
          .pipe(pushAllFiles());

        // Process index.html
        gulp.src([distPath + '/index.html'])
          .pipe(mustache({
            title: opt.title,
            extraHead: opt.extraHead,
            appRoot: opt.appRoot,
            socketIo: opt.socketIo,
            filesConfig: JSON.stringify(filesConfig)
          }))
          .pipe(pushAllFiles());
      });
    }
  );
};

/* Built-in server */

module.exports.server = function(options) {
  var serverModule = sgServer(options),
    app = serverModule.app,
    server = serverModule.server;

  app.set('port', options.port || 3000);
  server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
  });
  return serverModule;
};

/* Utility functions */

function getMarkdownStream(filePath) {
  var renderer = {};
  // Define custom renderers for markup blocks
  renderer.heading = function(text, level) {
    return '<h' + level + ' class="sg">' + text + '</h' + level + '>';
  };
  renderer.paragraph = function(text) {
    return '<p class="sg">' + text + '</p>';
  };
  renderer.listitem = function(text) {
    return '<li class="sg">' + text + '</li>\n';
  };
  renderer.link = function(href, title, text) {
    if (this.options.sanitize) {
      try {
        var prot = decodeURIComponent(unescape(href))
          .replace(/[^\w:]/g, '')
          .toLowerCase();
      } catch (e) {
        return '';
      }
      if (prot.indexOf('javascript:') === 0) {
        return '';
      }
    }
    var out = '<a class="sg" href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  };
  renderer.code = function(code, lang, escaped) {
    var htmlEscape = function(html, encode) {
      return html
        .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    if (this.options.highlight) {
      var out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    if (!lang) {
      return '<pre class="sg"><code>'
        + (escaped ? code : htmlEscape(code, true))
        + '\n</code></pre>';
    }

    return '<pre class="sg"><code class="'
      + this.options.langPrefix
      + htmlEscape(lang, true)
      + '">'
      + (escaped ? code : htmlEscape(code, true))
      + '\n</code></pre>\n';
  }
  return vfs.src(filePath)
    .pipe(marked({renderer: renderer}))
}

function sanitize(string) {
  return sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
}

// Processes all SASS/LESS/CSS files and combine to a single file
function getPreprocessStream(files, opt) {
  opt.sass.quiet = true; // Supress gulp-ruby-sass messages
  var sassStream,
    lessStream,
    cssStream;

  sassStream = vfs.src(files)
    .pipe(filter('**/*.scss'))
    .pipe(sass(opt.sass))
    .pipe(concat('sass.css'));

  lessStream = vfs.src(files)
    .pipe(filter('**/*.less'))
    .pipe(less())
    .pipe(concat('less.css'));

  cssStream = vfs.src(files)
    .pipe(filter('**/*.css'))
    .pipe(concat('css.css'));

  return es.merge(sassStream, lessStream, cssStream)
    .pipe(concat('styleguide.css'));
}

// Parse node-kss object ( {'file.path': 'file.contents.toString('utf8'}' )
function parseKssMarkup(files, options, success) {
  var json = {};

  kss.parse(files, options, function(err, styleguide) {
    if (err) {
      new PluginError(PLUGIN_NAME, 'Error parsing', err);
      return false;
    } else {
      json.sections = jsonSections(styleguide.section());
      json.sections.map(function(section) {
        if (section.markup) {
          var re, match, wrapper;

          // Provide wrappedMarkup for all the entities
          section.wrappedMarkup = section.markup;
          section.modifiers.forEach(function(modifier) {
            modifier.wrappedMarkup = modifier.markup;
          });

          re = /^([\s\S]*)<sg\:wrapper>([\s\S]*)<\/sg\:wrapper>([\s\S]*)$/,
          match = re.exec(section.markup);

          // Wrap everything what can be wrapped
          if (match) {
            wrapper = match[2];
            section.markup = match[1];
            section.wrappedMarkup = wrapper.replace('<sg:wrapper-content/>', section.markup);
            section.modifiers.forEach(function(modifier) {
              match = re.exec(modifier.markup);
              if (match) {
                modifier.markup = match[1];
                modifier.wrappedMarkup = wrapper.replace('<sg:wrapper-content/>', modifier.markup);
              }
            });
          }
        }
        return section;
      });
      if (typeof success === 'function') {
        success(json);
      }
    }
  });
}

module.exports.parseKssMarkup = parseKssMarkup;

// Parses kss.KssSection to JSON
function jsonSections(sections) {
  return sections.map(function(section) {
    return {
      header: section.header(),
      description: sanitize(section.description()),
      modifiers: jsonModifiers(section.modifiers()),
      deprecated: section.deprecated(),
      experimental: section.experimental(),
      reference: section.reference(),
      markup: section.markup() ? section.markup().toString() : null
    }
  });
}

// Parses kss.KssModifier to JSON
function jsonModifiers(modifiers) {
  return modifiers.map(function(modifier, id) {
    return {
      id: id + 1,
      name: modifier.name(),
      description: sanitize(modifier.description()),
      className: modifier.className(),
      markup: modifier.markup() ? modifier.markup().toString() : null
    }
  });
}
