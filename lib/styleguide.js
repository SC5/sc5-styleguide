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
  sass = require('gulp-ruby-sass'),
  less = require('gulp-less'),
  concat = require('gulp-concat'),
  filter = require('gulp-filter'),
  es = require('event-stream'),
  chalk = require('chalk'),
  marked = require('marked');

module.exports = function(opt) {
  if (!opt) opt = {};
  opt = {
    dest: opt.dest || 'styleguide/',
    sass: opt.sass || {},
    markdownPath: opt.markdownPath || ''
  };
  if (!opt.kssOpt) opt.kssOpt = {};

  // Files object acts as our buffer
  var filesBuffer = {};

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

      filesBuffer[file.path] = file.contents.toString('utf8');

      // Make sure file goes through the next gulp plugin
      this.push(file);

      // We're done with this file!
      cb();
    },
    // After reading all files, parse them and generate data for styleguide
    function(cb) {
      var markdownPath, styleguide = jsonStyleGuide(filesBuffer, opt.kssOpt);

      // Read and parse the markdown file
      // TODO check async execution order
      if (opt.markdownPath) {
        fs.readFile(opt.markdownPath, function (err, file) {
          if (err) {
            console.error(chalk.red('Error reading file at ' + opt.markdownPath));
            throw err;
          }
          fs.writeFile(opt.dest + '/overview.html', marked(String(file)), function(err, buff) {
            if (err) {
              console.error(chalk.red('Error writing file to ' + opt.dest + '/overview.html'));
              throw err;
            }
          });
        });
      }

      preprocess(Object.keys(filesBuffer), opt, function() {
        // Write generated styleguide JSON to disk
        fs.writeFile(opt.dest + '/styleguide.json', JSON.stringify(styleguide),
          function(err, buff) {
          if (err) {
            return console.error('Error writing styleguide.json', err);
          }
          
          // We're all done!
          ncp(__dirname + '/public', opt.dest, function(err) {
            if (err) {
              return console.error('Error creating styleguide directory', err);
            }

            console.log('Styleguide created to', opt.dest);
            cb();
          });
        });
      });
    });
};

/* Utility functions */

function sanitize(string) {
  string = sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
  string = string.replace(/(\r\n|\n|\r|\&quot\;)/g, '');
  return string;
}

// Processes all SASS/LESS/CSS files, concats them and places file to dest
function preprocess(files, opt, callback) {

  opt.sass['quiet'] = true; // Supress gulp-ruby-sass messages
  var sassStream = vfs.src(files)
    .pipe(filter('**/*.scss'))
    .pipe(sass(opt.sass))
    .pipe(concat('sass.css'));

  var lessStream = vfs.src(files)
    .pipe(filter('**/*.less'))
    .pipe(less())
    .pipe(concat('less.css'));

  var cssStream = vfs.src(files)
    .pipe(filter('**/*.css'))
    .pipe(concat('css.css'));

  return es.merge(sassStream, lessStream, cssStream)
    .pipe(concat('styleguide.css'))
    .pipe(vfs.dest(opt.dest))
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
      json = jsonSections(styleguide.section());
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
