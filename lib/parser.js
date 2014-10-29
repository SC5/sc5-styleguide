module.exports = function() {
  var parseVariables,
      gonzales = require('gonzales-pe'),
      gonzo = require('gonzales-ast'),
      _ = require('lodash');

  function astToSrc(ast, syntax) {
    return gonzales.astToSrc({
      ast: ast,
      syntax: syntax
    });
  }

  // Parse SASS variables to object
  parseVariables = function(string, syntax) {

    syntax = syntax || 'scss'

    var out = {},
      ast = gonzales.srcToAST({
        src: string,
        syntax: syntax
      });

    gonzo.traverse(ast, [{
      test: function(name, nodes) {
        return name === 'declaration' && nodes[1][0] === 'variable';
      },
      process: function(nodes) {
        var varName = nodes[1][1][1].filter(function(element) {
            return element != 'ident'
          })[0],
          varVal = astToSrc(nodes[4], syntax);

        out[varName] = varVal;
      }
    }, {
      test: function(name, nodes) {
        return name === 'atrules';
      },
      process: function(nodes) {
        var varName = nodes[1][1][1],
          varVal = '';

        /* Grabs all the listed values
         * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */
        nodes.forEach(function(element) {
          if (
            element == 'atrules' ||
            element[0] == 'atkeyword'
          ) {
            return
          };
          if (
            element[0] == 'operator' &&
            element[1] == ':'
          ) {
            return;
          }
          varVal += astToSrc(element, 'less');
        });
        varVal = varVal.trim();
        out[varName] = varVal;
      }
    }]);

    return out;
  }

  // Modifies string so that variables passed in object are updated
  setVariables = function(string, syntax, variables) {
    var sorted = [], lines = [],
      ast, result, changeVariable;

    changeVariable = function(ast, key, value) {
      return gonzo.traverse(ast, [
        {
          test: function(name, nodes) {
            return name === 'declaration' && nodes[1][0] === 'variable' && nodes[1][1].indexOf(key) !== -1;
          },
          process: function(node) {
            node[4] = [
            'value',
             value
            ]
            return node;
          }
        },
        {
          test: function(name, nodes) {
            if (name === 'atrules') {
              console.log(nodes);
            }
            return name === 'atrules';
          },
          process: function(node) {
            var varName = node[1][1][1];

            /* Processed the variables declared as atrules
            * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */
            node.forEach(function(element) {
              if (
                element == 'atrules' ||
                element[0] == 'atkeyword'
              ) {
                return
              };
              if (
                element[0] == 'operator' &&
                element[1] == ':'
              ) {
                return;
              }
              if (
                element[0] == 's'
              ) {
                return;
              }
              if (varName == key) {
                element = [value];
              }
            });
            return node;
          }
        }
      ]);
    }


    ast = gonzales.srcToAST({
      src: string,
      syntax: syntax
    });

    _.forEach(variables, function(value, key){
      ast = changeVariable(ast, key, value);
    });

    result = gonzales.astToSrc({
      ast: ast,
      syntax: syntax
    });
    return result;
  }

  return {
    parseVariables: parseVariables,
    setVariables: setVariables
  }
}
