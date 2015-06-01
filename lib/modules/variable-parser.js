'use strict';

var gonzales = require('gonzales-pe'),
    traverser = require('./ast-traverser'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash'),
    ignoreBlock = require('./ignore-block');

// Parse Style variables to object
function parseVariableDeclarations(string, syntax) {
  syntax = syntax || 'scss';
  string = ignoreBlock.removeIgnoredBlocks(string);

  // Do not parse empty files. Otherwise gonzales.parse will fail
  if (!string) {
    return [];
  }

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      }),
      visitors = {
        sass: {
          // Visitor for SASS, SCSS and plain CSS syntaxes
          test: function(name, nodes) {
            return name === 'declaration' && nodes.content[0].content[0].type === 'variable';
          },
          process: function(nodes) {
            var varName = nodes.content[0].content[0].content[0].content;
            out.push({name: varName, value: nodes.content[3].toCSS(syntax)});
          }
        },
        less: {
          // Visitor for LESS syntax
          test: function(name) {
            return name === 'atrules';
          },
          process: function(nodes) {
            var varName = nodes.content[0].content[0].content,
              varVal = '';

            // Skip at-keywords that do not decrade variable (Ex. @imports)
            if (nodes.content[1].type === 'operator' && nodes.content[1].content === ':') {
              /* Grabs all the listed values
              * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */

              nodes.content.forEach(function(element) {
                if (element.type === 'atrules' || element.type === 'atkeyword') {
                  return;
                }
                if (element.type === 'operator' && element.content === ':') {
                  return;
                }
                varVal += element.toCSS(syntax); // Syntax is always less as this visitor is only for LESS
              });

              out.push({name: varName, value: varVal.trim()});
            }
          }
        }
      },
      visitor;

  visitors.css = visitors.sass;
  visitors.scss = visitors.sass;
  visitor = visitors[syntax];

  traverser.traverse(ast, [visitor]);

  return out;
}

// Parse Style variables to object
function findVariables(string, syntax) {
  syntax = syntax || 'scss';
  string = ignoreBlock.removeIgnoredBlocks(string);

  // Do not parse empty files. Otherwise gonzales.parse will fail
  if (!string) {
    return [];
  }

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      }),
      visitors = {
        sass: {
          // Visitor for SASS, SCSS and plain CSS syntaxes
          test: function(name, nodes) {
            return (name === 'declaration' && nodes.content[0].content[0].type === 'variable') || (name === 'variable' && nodes.content[0].type === 'ident');
          },
          process: function(nodes) {
            if (nodes.type !== 'declaration') {
              out.push(nodes.content[0].content);
            }
          }
        }
      },
      visitor;
  // For this task LESS visitor is identical to SASS
  visitors.less = visitors.sass;
  visitors.css = visitors.sass;
  visitors.scss = visitors.sass;
  visitor = visitors[syntax];

  traverser.traverse(ast, [visitor]);

  return out;
}
function parseVariableDeclarationsFromFiles(files) {
  var filePromises = Object.keys(files).map(function(filePath) {
    var contents = files[filePath],
        syntax = path.extname(filePath).substring(1);

    return Q.promise(function(resolve) {
      var fileVariables = parseVariableDeclarations(contents, syntax);
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
      if (/^[\@|\$]/.test(modifier.name)) {
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
  findModifierVariables: findModifierVariables
};
