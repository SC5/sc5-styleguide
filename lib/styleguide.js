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

var path = require('path'),
  jade = require('jade'),
  through = require('through2'),
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  mustache = require('gulp-mustache'),
  sass = require('gulp-sass'),
  please = require('gulp-pleeease'),
  replace = require('gulp-replace'),
  neat = require('node-neat'),
  minimatch = require('minimatch'),
  fs = require('fs-extra'),
  File = require('vinyl'),
  crypto = require('crypto'),
  Q = require('q'),
  _ = require('lodash'),
  markdown = require('./modules/markdown'),
  atRules = require('./modules/at-rules'),
  variableParser = require('./modules/variable-parser'),
  kssParser = require('./modules/kss-parser'),
  angularFiles = require('./modules/angular-files'),
  pseudoSelectors = require('./modules/pseudo-selectors'),
  wrapperMarkup = require('./modules/wrapper-markup'),
  sectionReferences = require('./modules/section-references'),
  common = require('./modules/common'),
  sgServer = require('./server'),
  distPath = path.join(__dirname, 'dist'),
  fileHashes = {},
  jadeCache = {},
  serverInstance;

function socketIsOpen() {
  return serverInstance && serverInstance.io;
}

function emitProgressStart() {
  if (socketIsOpen()) {
    serverInstance.io.emitProgressStart();
  }
}

function emitProgressEnd() {
  if (socketIsOpen()) {
    serverInstance.io.emitProgressEnd();
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

function groupModuleFiles(allModules) {
  // Group modules by module name
  var namedModules = _.groupBy(allModules, function(module) {
    return module.name;
  });

  // Commbile files from every module that has the same name
  return _.map(namedModules, function(modules, moduleName) {
    var files = _.uniq(_.reduce(modules, function(files, singleModule) {
      return files.concat(singleModule.files);
    }, []));
    return {
      name: moduleName,
      files: files
    };
  });
}


function generateJadeMarkup(json) {

  // path to bemto
  var bemtoinclude  = 'include ./node_modules/bemto.jade/bemto.jade\n';
  // jade compiler options
  var options = {
    filename : __dirname,
    compileDebug : true,
    pretty : true
  }

  _.each(json.sections, convertToJade);

  function convertToJade(section){
    if (!section.markup) return;
    if (/^</.test(section.markup)) return;

    section.markupJade = section.markup;  
    if (jadeCache[bemtoinclude+section.markup]) {
      section.markup = jadeCache[bemtoinclude+section.markup];
    } else {
      section.markup = jadeCache[bemtoinclude+section.markup] = jade.render(bemtoinclude+section.markup, options);
    }
    
    if (section.modifiers) {
      _.each(section.modifiers, convertToJade);
    }
  }
  /*
  //console.log(json.sections); return;
  if (!/!</.test(json.sections.markup)) {

  }
  */
}


function generateSectionWrapperMarkup(json) {
  json.section = wrapperMarkup.generateSectionWrapperMarkup(json.sections);
}

function replaceSectionReferences(json) {
  json.sections = sectionReferences.replace(json.sections);
}

function copyUsedOptionsToJsonConfig(opt, json) {
  var used = ['appRoot', 'extraHead', 'commonClass', 'title', 'disableEncapsulation', 'disableHtml5Mode', 'readOnly'];
  json.config = {};
  used.forEach(function(prop) {
    json.config[prop] = _.cloneDeep(opt[prop]);
  });
  return json;
}

function copyUsedOptionsToInlineJsonConfig(opt, json) {
  var used = ['title', 'disableEncapsulation', 'disableHtml5Mode'];
  json.config = {};
  used.forEach(function(prop) {
    json.config[prop] = _.cloneDeep(opt[prop]);
  });
  return json;
}

function addFileHashesAndReplaceAbsolutePaths(json) {
  if (!json) {
    return;
  }

  if (json.variables) {
    json.variables.forEach(function(variable) {
      variable.fileHash = fileHashes[variable.file];
      variable.file = basenameOf(variable.file);
    });
  }

  if (json.variables) {
    json.sections.forEach(function(section) {
      section.fileHash = fileHashes[section.file];
      section.file = basenameOf(section.file);
    });
  }
}

function basenameOf(p) {
  return path.basename(p);
}

function appendUsedVariablesToEachBlock(opt, styleguide) {
  // Go trough every styleguide style block and find used variables
  styleguide.sections.forEach(function(section) {
    // It is possible that the CSS is not valid anymore after it is splitted to sections
    // We need to catch possible parsing errors
    try {
      if (section.css) {
        section.variables = variableParser.findVariables(section.css, section.syntax, opt);
      }
    } catch (e) {
      console.error('Could not parse used variables from section', section.reference + ':');
      console.error(e.toString());
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

module.exports.generate = function(options) {
  var opt = common.sanitizeOptions(options),
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

    // Exclude empty files
    if (file.contents.toString('utf8') !== '') {
      filesBuffer[file.path] = file.contents.toString('utf8');
      var hash = crypto.createHash('md5').update(file.path).digest('hex');
      fileHashes[file.path] = hash;
      fileHashes[hash] = file.path;
    }

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
        parseVariablesPromise = variableParser.parseVariableDeclarationsFromFiles(variableFiles, opt);

      Q.all([parseKSSPromise, parseVariablesPromise]).spread(function(sections, variables) {
        styleguide.sections = sections;
        styleguide.variables = variables;

        // Extend config with Angular directives declared in KSS
        opt.filesConfig = angularFiles.add(opt.filesConfig, sections);

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

        generateJadeMarkup(styleguide);
        replaceSectionReferences(styleguide);
        generateSectionWrapperMarkup(styleguide);
        copyUsedOptionsToJsonConfig(opt, styleguide);
        appendUsedVariablesToEachBlock(opt, styleguide);
        addFileHashesAndReplaceAbsolutePaths(styleguide);

        // Create JSON containing KSS data
        _this.push(new File({
          path: 'styleguide.json',
          contents: new Buffer(JSON.stringify(styleguide))
        }));

        var stylesCompiled,
          overviewProcessed,
          filesCopied,
          indexHtmlProcessed;

        overviewProcessed = processOverviewMarkdown(opt);

        // Copy all files (except index.html) from dist from to output stream
        filesCopied = Q.Promise(function(resolve) {
          gulp.src([distPath + '/**', '!' + distPath + '/index.html'])
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        // Compile UI styles
        stylesCompiled = Q.Promise(function(resolve) {
          var sassSrc = [distPath + '/sass/styleguide-app.scss', distPath + '/sass/styleguide_helper_elements.scss'],
            sassIncludePaths = neat.includePaths || [];

          // If we have custom colors defined. Overwrite default empty file
          if (opt.customColors) {
            try {
              fs.copySync(opt.customColors, distPath + '/sass/_styleguide_custom_variables.scss');
              // Add directory of custom colors file to SASS includePaths
              // This allows to including external files in custom variable file
              sassIncludePaths.push(path.resolve(path.dirname(opt.customColors)));
            } catch (err) {
              console.log('ERROR: customColors option is defined but the file is not copyable. Using default colors.');
            }
          }
          gulp.src(sassSrc)
            .pipe(replace('{{{appRoot}}}', opt.appRoot))
            .pipe(sass({
              // Include neat
              includePaths: neat.includePaths
            }))
            .pipe(please({
              minifier: false
            }))
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        // Process index.html
        indexHtmlProcessed = Q.Promise(function(resolve) {
          gulp.src([distPath + '/index.html'])
            .pipe(mustache({
              title: opt.title,
              extraHead: opt.extraHead,
              styleguideConfig: JSON.stringify(copyUsedOptionsToInlineJsonConfig(opt, {}).config),
              appRoot: opt.appRoot,
              socketIo: opt.server,
              filesConfig: JSON.stringify(groupModuleFiles(opt.filesConfig))
            }))
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        Q.all([stylesCompiled, overviewProcessed, filesCopied, indexHtmlProcessed])
          .then(function() {
            if (opt.server) {
              opt.fileHashes = fileHashes;
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
  ).on('error', console.error.bind(console)).on('end', function() {
    emitProgressEnd();
  });
};

/* Build pseudo styles and ay rules from preprocessed CSS styles */

module.exports.applyStyles = function() {
  var throughOpts = {
    objectMode: true,
    allowHalfOpen: false
  }, stylesBuffer = '',
    pseudoStylesBuffer = '',
    atRulesBuffer = '';

  function bufferFileContents(file, enc, done) {
    var pseudoStylesPromise,
      atRulesPromise;

    // Make sure file goes through the next gulp plugin
    // jshint -W040
    this.push(file);
    // jshint +W040

    // Process only CSS files
    // For example gulp-ruby-sass generatsd sourcemaps to the stream that we do not want to include
    if (path.extname(file.path) !== '.css') {
      done();
      return;
    }

    // Add styles to common stylesheet
    stylesBuffer += file.contents.toString();

    // Create stylesheet that contains pseudo styles
    pseudoStylesPromise = Q.Promise(function(resolve) {
      pseudoStylesBuffer += pseudoSelectors.stylesFromString(file.contents.toString(), {
        source: file.path
      });
      resolve();
    });

    // Create stylesheet that contains at-rules
    atRulesPromise = Q.Promise(function(resolve) {
      atRulesBuffer += atRules.stylesFromString(file.contents.toString(), {
        source: file.path
      });
      resolve();
    });

    Q.all([pseudoStylesPromise, atRulesPromise]).then(function() {
      done();
    });
  }

  return through(throughOpts, bufferFileContents, function(cb) {
    this.push(new File({
      path: 'styleguide.css',
      contents: new Buffer(stylesBuffer)
    }));

    this.push(new File({
      path: 'styleguide_pseudo_styles.css',
      contents: new Buffer(pseudoStylesBuffer)
    }));

    this.push(new File({
      path: 'styleguide_at_rules.css',
      contents: new Buffer(atRulesBuffer)
    }));

    cb();
  }).on('end', function() {
    if (socketIsOpen()) {
      serverInstance.io.emitStylesChanged();
    }
  });
};

/* Built-in server */

module.exports.server = function(options) {
  startServer(options);
};

function startServer(options) {
  var port = options.port;
  // Ignore start server if we already have instance running
  if (!serverInstance) {
    serverInstance = sgServer(options);
    serverInstance.app.set('port', port);
    serverInstance.server.listen(serverInstance.app.get('port'), function() {
      console.log('Express server listening on port ' + serverInstance.server.address().port);
    }).on('error', function(error) {
      if (error.code === 'EADDRINUSE') {
        console.error('Port:' + port + ' is already in use.');
        console.error('Please provide port using --port <port>');
      }
    });
  }
  return serverInstance;
}
