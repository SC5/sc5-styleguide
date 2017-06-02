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
  pug = require('pug'),
  through = require('through2'),
  concat = require('gulp-concat'),
  gulp = require('gulp'),
  rename = require('gulp-rename'),
  mustache = require('gulp-mustache'),
  postcss = require('gulp-postcss'),
  replace = require('gulp-replace'),
  minimatch = require('minimatch'),
  fs = require('fs-extra'),
  File = require('vinyl'),
  LocalCache = require('node-localcache'),
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
  addSection = require('./modules/helpers/add-section'),
  sgServer = require('./server'),
  distPath = path.join(__dirname, 'dist'),
  libPath = path.join(__dirname, 'app'),
  fileHashes = {},
  pugCache,
  sgOptions, // global object for options
  serverInstance,
  bemtoPath = require.resolve('bemto.pug');

function socketIsOpen() {
  return serverInstance && serverInstance[sgOptions.port].io;
}

function emitProgressStart() {
  if (socketIsOpen()) {
    serverInstance[sgOptions.port].io.emitProgressStart();
  }
}

function emitProgressEnd() {
  if (socketIsOpen()) {
    serverInstance[sgOptions.port].io.emitProgressEnd();
  }
}

function emitCompileError(error) {
  if (socketIsOpen()) {
    serverInstance[sgOptions.port].io.emitCompileError(error);
  }
}

function emitCompileSuccess() {
  if (socketIsOpen()) {
    serverInstance[sgOptions.port].io.emitCompileSuccess();
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

function generatePugMarkup(json, options) {
  pugCache = new LocalCache(path.resolve(options.rootPath, 'pugcache.json'));

  var rootPath = path.resolve(__dirname, '../');
  rootPath = path.relative(rootPath, bemtoPath);

  // path to bemto
  var bemtoinclude = 'include ./' + rootPath + '\n',
      pugOptions = {
        filename: __dirname,
        basedir: process.cwd(),
        compileDebug: true,
        pretty: true
      };

  _.each(json.sections, convertToPug);

  var parentref;
  function convertToPug(section) {
    var cacheKey, pugstring, md5;

    if (!section.markup) { return; }
    if (/<[a-z][\s\S]*>/i.test(section.markup)) { return; }

    section.markupPug = section.markup;

    if (section.reference) {
      parentref = section.reference;
      cacheKey = section.reference;
    } else {
      cacheKey = parentref + ' - ' + section.name;
    }

    pugstring = bemtoinclude + section.markup;
    md5 = crypto.createHash('md5').update(pugstring).digest('hex');

    if (pugCache.getItem(cacheKey) && pugCache.getItem(cacheKey).key === md5) {
      section.markup = pugCache.getItem(cacheKey).value;
    } else {
      section.markup = pug.render(pugstring, pugOptions);
      pugCache.setItem(cacheKey, {
        key : md5,
        value : section.markup
      });
    }

    if (section.modifiers) {
      _.each(section.modifiers, convertToPug);
    }
  }
}

function generateStyleguideAppStyles(opt) {
  var srcFiles;
  srcFiles = [distPath + '/css/_fontpath_and_mixin_definition.css'];

  if (opt.includeDefaultStyles) {
    srcFiles.push(distPath + '/css/_styleguide_default_styles.css');
  }

  srcFiles.push(distPath + '/css/_custom_styles_mixin.css');
  gulp.src(srcFiles)
    .pipe(concat('styleguide-app.css'))
    .pipe(gulp.dest(libPath + '/css/'))
    .pipe(gulp.dest(distPath + '/css/'));
}

function generateSectionWrapperMarkup(json) {
  json.section = wrapperMarkup.generateSectionWrapperMarkup(json.sections);
}

function replaceSectionReferences(json) {
  json.sections = sectionReferences.replace(json.sections);
}

function copyUsedOptionsToJsonConfig(opt, json) {
  var used = [
    'appRoot',
    'extraHead',
    'beforeBody',
    'afterBody',
    'commonClass',
    'title',
    'disableEncapsulation',
    'disableHtml5Mode',
    'readOnly',
    'sideNav',
    'showReferenceNumbers',
    'afterSections',
    'showMarkupSection',
    'hideSubsectionsOnMainSection',
    'includeDefaultStyles',
    'additionalNgDependencies',
  ];
  json.config = {};
  used.forEach(function(prop) {
    json.config[prop] = _.cloneDeep(opt[prop]);
  });

  return json;
}

function copyUsedOptionsToInlineJsonConfig(opt, json) {
  var used = [
    'title',
    'disableEncapsulation',
    'disableHtml5Mode',
    'sideNav',
    'showReferenceNumbers',
    'afterSections',
    'showMarkupSection',
    'hideSubsectionsOnMainSection',
    'additionalNgDependencies',
  ];
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
    },
    styleguideProcessors = _.extend(
        {
          10: replaceSectionReferences,
          20: generateSectionWrapperMarkup
        },
        opt.styleguideProcessors
    );
  sgOptions = opt; // Copy options into global

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
        parseKSSPromise = kssParser.parseKssSections(filesBuffer, opt.kssOpt, opt.parsers),
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

        options.enablePug && generatePugMarkup(styleguide, options);

        _.each(styleguideProcessors, function(processor) {
          processor(styleguide);
        });

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
          favIcon,
          indexHtmlProcessed;

        overviewProcessed = processOverviewMarkdown(opt);
        generateStyleguideAppStyles(opt);
        var cssSrc = [distPath + '/css/styleguide-app.css', distPath + '/css/styleguide_helper_elements.css'];

        // Copy all files (except index.html) from dist from to output stream
        filesCopied = Q.Promise(function(resolve) {
          //gulp.src([distPath + '/**', '!' + distPath + '/index.html', + '!' + distPath + '**/*.css'])
          var copySrc = [distPath + '/**', '!' + distPath + '/index.html'];

          copySrc = copySrc.concat(cssSrc.map(function(item) {
            return '!' + item;
          }));

          gulp.src(copySrc)
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        // Copy favicon file into asset folder
        favIcon = Q.Promise(function(resolve) {
          // If we have custom colors defined. Overwrite default empty file
          if (opt.favIcon) {
            try {
              fs.copySync(opt.favIcon, distPath + '/assets/img/favicon.ico');
            } catch (err) {
              console.log('ERROR: Favicon option is defined but the file is not copyable. Using default favicon.');
            }
          }
          resolve();
        });

        // Compile UI styles
        stylesCompiled = Q.Promise(function(resolve) {

          // If we have custom colors defined. Overwrite default empty file
          if (opt.customColors) {
            try {
              fs.copySync(opt.customColors, distPath + '/css/_styleguide_custom_variables.css');
              // Add directory of custom colors file to SASS includePaths
              // This allows to including external files in custom variable file
            } catch (err) {
              console.log('ERROR: customColors option is defined but the file is not copyable. Using default colors.');
            }
          }
          gulp.src(cssSrc)
            .pipe(replace('{{{appRoot}}}', opt.appRoot))
            .pipe(postcss([
              require('postcss-partial-import'),
              require('postcss-mixins'),
              require('cssnext'),
              require('postcss-advanced-variables'),
              require('postcss-conditionals'),
              require('postcss-color-function'),
              require('postcss-color-alpha'),
              require('postcss-nested'),
              require('postcss-custom-media'),
              require('autoprefixer'),
              require('postcss-inline-comment')
            ]))
            // Strings hack
            .pipe(replace(/url\((.*)\)/g, function(replacement, parsedPath) {
              return 'url(\'' + parsedPath.replace(/'/g, '') + '\')';
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
              beforeBody: opt.beforeBody,
              afterSections: opt.afterSections,
              afterBody: opt.afterBody,
              sideNav: opt.sideNav,
              showMarkupSection: opt.showMarkupSection,
              hideSubsectionsOnMainSection: opt.hideSubsectionsOnMainSection,
              styleguideConfig: JSON.stringify(copyUsedOptionsToInlineJsonConfig(opt, {}).config),
              appRoot: opt.appRoot,
              socketIo: opt.server,
              filesConfig: JSON.stringify(groupModuleFiles(opt.filesConfig))
            }))
            .pipe(pushAllFiles())
            .on('finish', resolve);
        });

        Q.all([stylesCompiled, overviewProcessed, filesCopied, favIcon, indexHtmlProcessed])
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
      serverInstance[sgOptions.port].io.emitStylesChanged();
    }
  });
};

/* Built-in server */

module.exports.server = function(options) {
  return startServer(options);
};

function startServer(options) {
  // Ignore start server if we already have instance running on the same port
  if (!serverInstance) {
    serverInstance = {};
  }
  if (!serverInstance[options.port]) {
    var port = options.port;
    serverInstance[port] = sgServer(options);
    serverInstance[port].app.set('port', port);
    serverInstance[port].server.listen(serverInstance[port].app.get('port'), function() {
      console.log('Express server listening on port ' + serverInstance[port].server.address().port);
    }).on('error', function(error) {
      if (error.code === 'EADDRINUSE') {
        console.error('Port:' + port + ' is already in use.');
        console.error('Please provide port using --port <port>');
      }
    });
  }
  return serverInstance[options.port];
}

module.exports.addSection = addSection;
