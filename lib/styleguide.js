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
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  markdown = require(__dirname + '/modules/markdown'),
  mustache = require('gulp-mustache'),
  variableParser = require(__dirname + '/modules/variable-parser'),
  parseKSS = require(__dirname + '/modules/kss-parser').parseKSS,
  pseudoSelectors = require(__dirname + '/modules/pseudo-selectors'),
  preprocess = require(__dirname + '/modules/preprocess'),
  wrapperMarkup = require(__dirname + '/modules/wrapper-markup'),
  path = require('path'),
  sgServer = require(__dirname + '/server'),
  File = require('vinyl'),
  Q = require('q'),
  distPath = __dirname + '/dist',
  serverInstance;

function sanitizeOptions(opt) {
  return {
    title: opt.title || 'Styleguide Generator',
    sass: opt.sass || {},
    less: opt.less || {},
    kssOpt: opt.kssOpt || {},
    overviewPath: opt.overviewPath || __dirname + '/overview.md',
    extraHead: (typeof opt.extraHead === 'object') ? opt.extraHead.join('\n') : '',
    appRoot: opt.appRoot || '',
    commonClass: opt.commonClass || '',
    styleVariables: opt.styleVariables || '',
    server: opt.server || false,
    port: opt.port,
    rootPath: opt.rootPath,
    filesConfig: opt.filesConfig
  };
}

function socketIsOpen() {
  return serverInstance && serverInstance.io;
}

function emitProgressStart() {
  if (socketIsOpen()) {
    serverInstance.io.emitProgressStart();
  }
}

function emitCompileError(error) {
  if (socketIsOpen()) {
    serverInstance.io.emitCompileError(error);
  }
}

function emitCompileSuccess() {
  if (socketIsOpen()) {
    serverInstance.io.emitCompileSuccess();
  }
}

function generateInheritedWrappers(json) {
  json.sections = wrapperMarkup.generateSectionWrapperMarkup(json.sections);
}

function saveOptionsAsJsonConfig(opt, json) {
  json.config = opt;
}

function removeConfigOutputPath(json) {
  if (json.config) {
    delete json.config.outputPath;
  }
}

function appendUsedVariablesToEachBlock(opt, styleguide) {
  if (opt.styleVariables) {
    var syntax = path.extname(opt.styleVariables).substring(1);
    // Parse variables from the defined file
    styleguide.config.settings = variableParser.parseVariables(fs.readFileSync(opt.styleVariables, 'utf-8'), syntax);
    // Go trough every styleguide style block and find used variables
    styleguide.sections.forEach(function(section) {
      if (section.css) {
        section.variables = variableParser.findVariables(section.css, syntax);
      }
      return section;
    });
  }
}

module.exports = function(options) {
  var opt = sanitizeOptions(options),
    filesBuffer = {},
    compileErrors = 0,
    throughOpts = {
      objectMode: true,
      allowHalfOpen: false
    };

  function bufferFileContents(file, enc, done) {
    if (file.isNull()) {
      return;
    }
    if (file.isStream()) {
      return console.error('Styleguide does not support streams!');
    }

    filesBuffer[file.path] = file.contents.toString('utf8');

    // Make sure file goes through the next gulp plugin
    this.push(file);
    done();
  }

  emitProgressStart();

  // A stream through which each file will pass
  return through(throughOpts, bufferFileContents, function(callback) {
      var _this = this;

      parseKSS(filesBuffer, opt.kssOpt).then(function(styleguide) {
        function pushAllFiles() {
          return through.obj(function(file, enc, cb) {
            _this.push(file);
            cb();
          });
        }

        function processOverviewMarkdown(opt) {
          return Q.Promise(function(resolve) {
            if (!opt.overviewPath) {
              resolve();
            }
            markdown.getStream(opt.overviewPath)
              .pipe(rename(function(path) {
                path.basename = 'overview';
                path.extname = '.html';
              }))
              .pipe(pushAllFiles())
              .on('finish', resolve);
          });
        }

        generateInheritedWrappers(styleguide);
        saveOptionsAsJsonConfig(opt, styleguide);
        removeConfigOutputPath(styleguide);
        appendUsedVariablesToEachBlock(opt, styleguide);

        // Create JSON containing KSS data
        _this.push(new File({
          path: 'styleguide.json',
          contents: new Buffer(JSON.stringify(styleguide))
        }));

        var overviewProcessed,
          preProcessingDone,
          filesCopied,
          indexHtmlProcessed;

        overviewProcessed = processOverviewMarkdown(opt);

        // Preprocess all CSS files and combile then to a single file
        preProcessingDone = Q.Promise(function(resolve, reject) {
          preprocess.getStream(Object.keys(filesBuffer), opt, reject)
            .pipe(through.obj(function(file, enc, cb) {

              // Create stylesheet that contains pseudo styles
              _this.push(new File({
                path: 'styleguide_pseudo_styles.css',
                contents: new Buffer(pseudoSelectors.stylesFromString(file.contents.toString()))
              }));

              _this.push(file);
              cb();
            }).on('finish', resolve));
        });

        // Copy all files (except index.html) from dist from to output stream
        filesCopied = Q.Promise(function(resolve, reject) {
          gulp.src([distPath + '/**', '!' + distPath + '/index.html'])
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        // Process index.html
        indexHtmlProcessed = Q.Promise(function(resolve, reject) {
          gulp.src([distPath + '/index.html'])
            .pipe(mustache({
              title: opt.title,
              extraHead: opt.extraHead,
              appRoot: opt.appRoot,
              socketIo: opt.server,
              filesConfig: JSON.stringify(opt.filesConfig)
            }))
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        Q.all([overviewProcessed, preProcessingDone, filesCopied, indexHtmlProcessed])
          .then(function() {
            if (opt.server) {
              startServer(opt);
            }
            emitCompileSuccess();
          })
          .catch(function(error) {
            console.error(error.toString());
            emitCompileError(error);
          })
          .finally(callback);
      }).catch(function(error) {
        console.error(error.toString());
        emitCompileError(error);
        callback();
      });
    }
  ).on('error', console.error.bind(console));
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
}
