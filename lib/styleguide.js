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
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  markdown = require(__dirname + '/modules/markdown'),
  atRules = require(__dirname + '/modules/at-rules'),
  mustache = require('gulp-mustache'),
  variableParser = require(__dirname + '/modules/variable-parser'),
  kssParser = require(__dirname + '/modules/kss-parser'),
  pseudoSelectors = require(__dirname + '/modules/pseudo-selectors'),
  preprocess = require(__dirname + '/modules/preprocess'),
  wrapperMarkup = require(__dirname + '/modules/wrapper-markup'),
  minimatch = require('minimatch'),
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
    css: opt.css || {},
    kssOpt: opt.kssOpt || {},
    overviewPath: opt.overviewPath || __dirname + '/overview.md',
    extraHead: (typeof opt.extraHead === 'object') ? opt.extraHead.join('\n') : opt.extraHead,
    appRoot: opt.appRoot || '',
    commonClass: opt.commonClass || '',
    styleVariables: opt.styleVariables || false,
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
  // Go trough every styleguide style block and find used variables
  styleguide.sections.forEach(function(section) {
    if (section.css) {
      section.variables = variableParser.findVariables(section.css, section.syntax);
    }
    variableParser.findModifierVariables(section.modifiers).forEach(function(varName) {
      if (!section.variables || section.variables.indexOf(varName) === -1) {
        section.variables = section.variables || [];
        section.variables.push(varName);
      }
    });
    return section;
  });
}

function filterFiles(files, filter) {
  var filtered = {};
  Object.keys(files).forEach(function(filePath) {
    if (minimatch(filePath, filter)) {
      filtered[filePath] = files[filePath];
    }
  });
  return filtered;
}

module.exports = function(options) {
  var opt = sanitizeOptions(options),
    filesBuffer = {},
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
    // jshint -W040
    this.push(file);
    // jshint +W040
    done();
  }

  emitProgressStart();

  // A stream through which each file will pass
  return through(throughOpts, bufferFileContents, function(callback) {
      var _this = this,
        // Styleguide object to be built
        styleguide = {},
        // Parse KSS sections
        parseKSSPromise = kssParser.parseKssSections(filesBuffer, opt.kssOpt),
        // Filter variable files
        // File paths are full absolute paths so we need to add wildcard prefix
        // Also empty wildcard should return all files
        variableFiles = opt.styleVariables ? filterFiles(filesBuffer, '**/' + opt.styleVariables) : filesBuffer,
        // Parse variable decarations from files
        parseVariablesPromise = variableParser.parseVariableDeclarationsFromFiles(variableFiles);

      Q.all([parseKSSPromise, parseVariablesPromise]).spread(function(sections, variables) {
        styleguide.sections = sections;
        styleguide.variables = variables;

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

              var styles = file.contents.toString(),
                  pseudoStylesPromise,
                  atRulesPromise;

              // Pass the actual preprocessed style file to output stream
              _this.push(file);

              // Create stylesheet that contains pseudo styles
              pseudoStylesPromise = Q.Promise(function(resolve) {
                var result = pseudoSelectors.stylesFromString(styles);
                _this.push(new File({
                  path: 'styleguide_pseudo_styles.css',
                  contents: new Buffer(result)
                }));
                resolve();
              });

              // Create stylesheet that contains at-rules
              atRulesPromise = Q.Promise(function(resolve) {
                var result = atRules.stylesFromString(styles);
                _this.push(new File({
                  path: 'styleguide_at_rules.css',
                  contents: new Buffer(result)
                }));
                resolve();
              });

              Q.all([pseudoStylesPromise, atRulesPromise]).then(function() {
                cb();
              });

            }).on('finish', resolve));
        });

        // Copy all files (except index.html) from dist from to output stream
        filesCopied = Q.Promise(function(resolve) {
          gulp.src([distPath + '/**', '!' + distPath + '/index.html'])
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        // Process index.html
        indexHtmlProcessed = Q.Promise(function(resolve) {
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
