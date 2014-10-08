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
var through2 = require('through2'),
  kss = require('kss'),
  sanitizeHtml = require('sanitize-html'),
  fs = require('fs'),
  ncp = require('ncp'),
  vfs = require('vinyl-fs'),
  sass = require('gulp-sass'),
  //sass = require('gulp-ruby-sass'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  es = require('event-stream'),
  chalk = require('chalk'),
  marked = require('marked'),
  mkdirp = require('mkdirp'),
  renderer = new marked.Renderer();

module.exports = function(opt) {
  if (!opt) opt = {};
  opt = {
    outputPath: opt.outputPath,
    sass: opt.sass || {},
    overviewPath: opt.overviewPath || __dirname + '/overview.md',
    extraHead: opt.extraHead
  };
  if (!opt.kssOpt) opt.kssOpt = {};

  // Files object acts as our buffer
  var filesBuffer = {},
    settingsStr = '',
    settingsRe = new RegExp('_styleguide_variables.scss');

  // A stream through which each file will pass
  return through2(
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

      if (settingsRe.test(file.path)) {
        console.log('_styleguide_variables.scss found! Generating settings.');
        settingsStr = String(file.contents);
      }

      filesBuffer[file.path] = file.contents.toString('utf8');

      // Make sure file goes through the next gulp plugin
      this.push(file);

      // We're done with this file!
      cb();
    },
    // After reading all files, parse them and generate data for styleguide
    function(cb) {
      var overviewPath, styleguide = jsonStyleGuide(filesBuffer, opt.kssOpt);

      // If settings file is found, generate settings object
      if (settingsStr) {
        styleguide.settings = parseSettings(settingsStr);
      }

      // Create destination folder
      mkdirp(opt.outputPath, function(err) {
        if (err) {
          return console.error(chalk.red('Error creating folder', opt.outputPath));
        }
      });

      // Read and parse the overview markdown file
      // TODO check async execution order
      if (opt.overviewPath) {
        fs.readFile(opt.overviewPath, function(err, file) {
          if (err) {
            console.error(chalk.red('Error reading file at ' + opt.overviewPath));
            throw err;
          }
          // Define custom renderers for markup blocks
          renderer.heading = function(text, level) {
            return '<h' + level + ' class="sg">' + text + '</h' + level + '>';
          }
          renderer.paragraph = function(text) {
            return '<p class="sg">' + text + '</p>';
          }
          renderer.listitem = function(text) {
            return '<li class="sg">' + text + '</li>\n';
          }
          renderer.code = function(code) {
            return '<pre class="sg"><code>' + code + '\n</code></pre>';
          }

          fs.writeFile(opt.outputPath + '/overview.html', marked(String(file), {renderer: renderer}), function(err, buff) {
            if (err) {
              console.error(chalk.red('Error writing file to ' + opt.outputPath + '/overview.html'));
              throw err;
            }
          });
        });
      }

      preprocess(Object.keys(filesBuffer), opt, function() {
        // Write generated styleguide JSON to disk
        fs.writeFile(opt.outputPath + '/styleguide.json', JSON.stringify(styleguide),
          function(err, buff) {
            if (err) {
              return console.error('Error writing styleguide.json', err);
            }
            // We're all done!
            ncp(__dirname + '/dist', opt.outputPath, function(err) {
              if (err) {
                return console.error('Error creating styleguide directory', err);
              }
              console.log('Styleguide created to', opt.outputPath);

              // Inject extraHead into HTML
              if (opt.extraHead) {
                fs.readFile(opt.outputPath + '/' + 'index.html', {encoding: 'utf8'}, function(err, data) {
                  var formattedData = data.replace(/<!-- extraHead -->/, opt.extraHead.join('\n'));
                  fs.writeFile(opt.outputPath + '/' + 'index.html', formattedData, function(err) {
                    if (err) {
                      throw err;
                    }
                    cb();
                  });
                });
              } else {
                cb();
              }
            });
          });
      });
    });
};

/* Utility functions */

function sanitize(string) {
  string = sanitizeHtml(string, {allowedTags: [], allowedAttributes: []})

  return string;
}

// Processes all SASS/LESS/CSS files, concats them and places file to outputPath
function preprocess(files, opt, callback) {

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
    .pipe(concat('styleguide.css'))
    .pipe(vfs.dest(opt.outputPath))
    .pipe(through2(
      {
        objectMode: true,
        allowHalfOpen: false
      }, function(file, enc, cb) {
        cb()
      }, function(cb) {
        callback();
        cb();
      }));
}

// Parse node-kss object ( {'file.path': 'file.contents.toString('utf8'}' )
function jsonStyleGuide(files, options) {
  var json = {};

  kss.parse(files, options, function(err, styleguide) {
    if (err) {
      new PluginError(PLUGIN_NAME, 'Error parsing', err);
      return false;
    } else {
      json.sections = jsonSections(styleguide.section());
    }
  });

  return json;
}

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
      markup: section.markup().toString()
    }
  });
}

// Parses kss.KssModifier to JSON
function jsonModifiers(modifiers) {
  return modifiers.map(function(modifier) {
    return {
      name: modifier.name(),
      description: sanitize(modifier.description()),
      className: modifier.className(),
      markup: modifier.markup().toString()
    }
  });
}

// Parses _styleguide_settings.scss
function parseSettings(string) {
  var out = {},
    re = /\$(.*?)\;/g,
    match,
    a;
  while (match = re.exec(string)) {
    a = match[1].match(/(.*)\:(.*)/);
    out[a[1]] = a[2].trim();
  }

  return out;
}
