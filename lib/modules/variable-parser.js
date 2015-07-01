'use strict';

var scssParser = require('./parsers/scss'),
    lessParser = require('./parsers/less'),
    postcssParser = require('./parsers/postcss'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash'),
    ignoreBlock = require('./ignore-block');

function getParserForSyntax(syntax, options) {
  var parserName;
  if (options) {
    parserName = options.parsers[syntax];
  }
  if (parserName === 'less') {
    return lessParser;
  } else if (parserName === 'sass' || parserName === 'scss') {
    // SCSS parser supports SCSS and SASS
    scssParser.setSyntax(parserName);
    return scssParser;
  } else if (parserName === 'postcss') {
    return postcssParser;
  }
  return;
}

// Parse Style variables to object
function parseVariableDeclarations(string, syntax, options) {
  string = ignoreBlock.removeIgnoredBlocks(string);
  var parser = getParserForSyntax(syntax, options);
  if (parser) {
    return parser.parseVariableDeclarations(string);
  }
  return [];
}

// Parse Style variables to object
function findVariables(string, syntax, options) {
  string = ignoreBlock.removeIgnoredBlocks(string);
  var parser = getParserForSyntax(syntax, options);
  if (parser) {
    return parser.findVariables(string);
  }
  return [];
}

function setVariables(string, syntax, variables, options) {
  var parser = getParserForSyntax(syntax, options);
  if (parser) {
    return parser.setVariables(string, variables, options);
  }
  return string;
}

function parseVariableDeclarationsFromFiles(files, options) {
  var filePromises = Object.keys(files).map(function(filePath) {
    var contents = files[filePath],
        syntax = path.extname(filePath).substring(1);

    return Q.promise(function(resolve) {
      var fileVariables = parseVariableDeclarations(contents, syntax, options);
      // Map correct file name to every variable
      fileVariables.forEach(function(variable) {
        variable.file = filePath;
      });
      resolve(fileVariables);
    });
  });

  return Q.all(filePromises).then(function(results) {
    return _.chain(results).flatten().sortBy('file').value();
  });
}

function findModifierVariables(modifiers) {
  var out = [];
  if (modifiers) {
    modifiers.forEach(function(modifier) {
      if (/^[\@|\$|\-\-]/.test(modifier.name)) {
        out.push(modifier.name.substring(1));
      }
    });
  }
  return out;
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  parseVariableDeclarationsFromFiles: parseVariableDeclarationsFromFiles,
  findVariables: findVariables,
  setVariables: setVariables,
  findModifierVariables: findModifierVariables
};
