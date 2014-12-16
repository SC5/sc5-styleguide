var gonzales = require('gonzales-pe'),
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
      ast = gonzales.srcToAST({
        src: string,
        syntax: syntax
      });

  gonzo.traverse(ast, [{
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
  }, {
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
  }]);

  return out;
}

// Parse Style variables to object
function findVariables(string, syntax) {
  syntax = syntax || 'scss';

  var out = [],
      ast = gonzales.srcToAST({
        src: string,
        syntax: syntax
      });

  // Find variables that are used in the styles
  gonzo.traverse(ast, [{
    // Visitor for SASS and SCSS syntaxes
    test: function(name, nodes) {
      return (name === 'declaration' && nodes[1][0] === 'variable') || (name === 'variable' && nodes[0] === 'ident');
    },
    process: function(nodes) {
      if (nodes[0] !== 'declaration') {
        out.push(nodes[1][1]);
      }
    }
  }, {
    // Visitor for LESS syntax
    test: function(name) {
      return name === 'value';
    },
    process: function(nodes) {
      nodes.forEach(function(element) {
        if (element[0] === 'atkeyword' && element[1][0] === 'ident') {
          out.push(element[1][1]);
        }
      });
    }
  }]);
  return out;
}

function byFileName(a, b) {
  if (a.file < b.file) {
    return -1;
  }
  if (a.file > b.file) {
    return 1;
  }
  return 0;
}

function parseVariableDeclarationsFromFiles(files) {
  return Q.Promise(function(resolve) {
    var variables = [],
      filePromises = [];

    Object.keys(files).forEach(function(filePath) {
      var contents = files[filePath],
        syntax = path.extname(filePath).substring(1);
      filePromises.push(Q.promise(function(resolve) {
        var fileVariables = parseVariableDeclarations(contents, syntax);

        // Map correct file name to every variable
        fileVariables.map(function(variable) {
          variable.file = filePath;
          return variable;
        });

        variables = variables.concat(fileVariables);
        resolve();
      }));
    });

    Q.all(filePromises).then(function() {
      // All files are processed. Sort variables by file name
      variables.sort(byFileName);
      // Call main promise
      resolve(variables);
    });
  });
}

// Modifies string so that variables passed in object are updated
function setVariables(string, syntax, variables) {
  var ast, result, changeVariable;

  changeVariable = function(ast, key, value) {

    var visitors = {
      sass: {
        // Visitor for SASS and SCSS syntaxes
        test: function(name, nodes) {
          return name === 'declaration' && nodes[1][0] === 'variable' && nodes[1][1].indexOf(key) !== -1;
        },
        process: function(node) {
          node[4] = ['value', value];
          return node;
        }
      },
      less: {
        // Visitor for LESS syntax
        test: function(name) {
          return name === 'atrules';
        },
        process: function(node) {
          var varName = node[1][1][1],
           savedSpace = false;

          /* Processed the variables declared as atrules
          * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */
          node.forEach(function(element, index) {
            if (element === 'atrules' || element[0] === 'atkeyword') {
              return element;
            }
            if (element[0] === 'operator' && element[1] === ':') {
              return element;
            }
            /* Save only first space */
            if (element[0] === 's' && savedSpace === false) {
              savedSpace = true;
              return;
            }
            if (varName === key) {
              delete node[index];
            }
          });
          if (varName === key) {
            node.push(['value', value]);
          }
          return node;
        }
      }
    }
    visitors.scss = visitors.sass;

    return gonzo.traverse(ast, [visitors[syntax]]);
  };

  ast = gonzales.srcToAST({
    src: string,
    syntax: syntax
  });

  _.forEach(variables, function(variable) {
    ast = changeVariable(ast, variable.name, variable.value);
  });

  result = gonzales.astToSrc({
    ast: ast,
    syntax: syntax
  });
  return result;
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
  setVariables: setVariables,
  findVariables: findVariables,
  findModifierVariables: findModifierVariables
};
