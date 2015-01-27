'use strict';

var gonzales = require('gonzales-pe'),
    jspath = require('jspath'),
    gonzo = require('gonzales-ast'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash');

function astToSrc(ast, syntax) {
  return gonzales.astToSrc({
    ast: ast,
    syntax: syntax
  });
}

// Parse Style variables to object
function parseVariableDeclarations(string, syntax) {
  syntax = syntax || 'scss';

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      }),
      visitors = {
        sass: {
          // Visitor for SASS and SCSS syntaxes
          test: function(name, nodes) {
            return name === 'declaration' && nodes[1][0] === 'variable';
          },
          process: function(nodes) {
            var varName = nodes[1][1][1].filter(function(element) {
              return element !== 'ident';
            })[0];

            out.push({name: varName, value: astToSrc(nodes[4], syntax)});
          }
        },
        less: {
          // Visitor for LESS syntax
          test: function(name) {
            return name === 'atrules';
          },
          process: function(nodes) {
            var varName = nodes[1][1][1],
              varVal = '';

            // Skip at-keywords that do not decrade variable (Ex. @imports)
            if (nodes[2][0] === 'operator' && nodes[2][1] === ':') {
              /* Grabs all the listed values
              * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */
              nodes.forEach(function(element) {
                if (element === 'atrules' || element[0] === 'atkeyword') {
                  return;
                }
                if (element[0] === 'operator' && element[1] === ':'
                ) {
                  return;
                }
                varVal += astToSrc(element, syntax); // Syntax is always less as this visitor is only for LESS
              });

              out.push({name: varName, value: varVal.trim()});
            }
          }
        }
      },
      traversers = {
        sass: function(node) {
          var variable = {};

          if (node.type !== 'declaration') {
            return;
          }

          node.map(function(nnode){
            if (nnode.type === 'variable') {
              nnode.map(function(nnnode){
                if (nnnode.type === 'ident') {
                  variable.name = nnnode.content;
                }
              });
            }
            if (nnode.type === 'value') {
              variable.value = nnode.toCSS(syntax);
            }
          });
          out.push(variable);
        }
      },
      traverser;

  traversers.scss = traversers.sass;
  traverser = traversers[syntax];

  ast.map(traverser);

  return out;
}

// Parse Style variables to object
function findVariables(string, syntax) {
  syntax = syntax || 'scss';

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      });

  var out = jspath.apply('..content{.type === "value" }..content{.type === "variable" }..content{.type === "ident"}.content', ast);

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

  return Q.all(filePromises).then(function() {
    return _.chain(arguments).flatten().sortBy('file').value();
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
