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
  fs = require('fs'),
  ncp = require('ncp'),
  gulp = require('gulp'),
  chalk = require('chalk'),
  rename = require('gulp-rename'),
  mkdirp = require('mkdirp'),
  markdown = require(__dirname + '/modules/markdown'),
  mustache = require('gulp-mustache'),
  parser = require(__dirname + '/modules/parser'),
  parseKSS = require(__dirname + '/modules/kss').parseKSS,
  pseudoSelectors = require(__dirname + '/modules/pseudo-selectors'),
  preprocess = require(__dirname + '/modules/preprocess'),
  path = require('path'),
  sgServer = require(__dirname + '/server'),
  File = require('vinyl'),
  distPath = __dirname + '/dist',
  callbackCount,
  serverInstance;

module.exports = function(opt) {
  if (!opt) opt = {};

  var filesConfig = opt.filesConfig,
    filesBuffer = {},
    checkIfDone;

  opt = {
    title: opt.title || 'Styleguide Generator',
    sass: opt.sass || {},
    less: opt.less || {},
    overviewPath: opt.overviewPath || __dirname + '/overview.md',
    extraHead: opt.extraHead || '',
    appRoot: opt.appRoot || '',
    commonClass: opt.commonClass || '',
    styleVariables: opt.styleVariables || '',
    server: opt.server || false,
    port: opt.port,
    rootPath: opt.rootPath
  };

  // If we have already server running emit info that we started progress
  if (serverInstance && serverInstance.io) {
    serverInstance.io.emitProgressStart();
  }

  if (typeof opt.extraHead === 'object') opt.extraHead = opt.extraHead.join('\n');
  if (!opt.kssOpt) opt.kssOpt = {};

  // A stream through which each file will pass
  // We have 4 different streams that we have to wait until the whole process is completed
  callbackCount = 4;

  checkIfDone = function(callback) {
    if (--callbackCount <= 0) {
      // We are all done. Check if we want to start server
      if (opt.server) {
        startServer(opt);
      }
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
      parseKSS(filesBuffer, opt.kssOpt, function(styleguide) {
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
        if (opt.styleVariables) {
          var syntax = path.extname(opt.styleVariables).substring(1);
          styleguide.config.settings = parser.parseVariables(fs.readFileSync(opt.styleVariables, 'utf-8'), syntax);
        }

        // Create JSON containing KSS data
        _this.push(new File({
          path: 'styleguide.json',
          contents: new Buffer(JSON.stringify(styleguide))
        }));

        // Process markdown file
        if (opt.overviewPath) {
          markdown.getStream(opt.overviewPath)
            .pipe(rename(function(path) {
              path.basename = 'overview';
              path.extname = '.html';
            }))
            .pipe(pushAllFiles())
        }

        // Preprocess all CSS files and combile then to a single file
        preprocess.getStream(Object.keys(filesBuffer), opt)
          .pipe(through.obj(function(file, enc, cb) {

            // Create stylesheet that contains pseudo styles
            _this.push(new File({
              path: 'styleguide_pseudo_styles.css',
              contents: new Buffer(pseudoSelectors.stylesFromString(file.contents.toString()))
            }));

            _this.push(file);
            cb();
          }).on('finish', function() {
            checkIfDone(callback);
          }));

        // Copy all files (except index.html) from dist from to output stream
        gulp.src([distPath + '/**', '!' + distPath + '/index.html'])
          .pipe(pushAllFiles());

        // Process index.html
        gulp.src([distPath + '/index.html'])
          .pipe(mustache({
            title: opt.title,
            extraHead: opt.extraHead,
            appRoot: opt.appRoot,
            socketIo: opt.server,
            filesConfig: JSON.stringify(filesConfig)
          }))
          .pipe(pushAllFiles());
      });
    }
  ).on('end', function() {
    if (serverInstance && serverInstance.io) {
      serverInstance.io.emitProgressEnd();
    }
  });
};

/* Built-in server */

module.exports.server = function(options) {
  startServer(options);
};

function startServer(options) {
  // Ignore start server if we alrady have instance running
  if (!serverInstance) {
    serverInstance = sgServer(options);
    serverInstance.app.set('port', options.port || 3000);
    serverInstance.server.listen(serverInstance.app.get('port'), function() {
      console.log('Express server listening on port ' + serverInstance.server.address().port);
    });
  }
  return serverInstance;
};
