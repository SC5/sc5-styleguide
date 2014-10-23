module.exports = function() {
  var parseVariables,
      gonzales = require('gonzales-pe'),
      gonzo = require('gonzales-ast');

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
          varVal = astToSrc(nodes[4], 'scss');
        out[varName] = varVal;
      }
    }]);

    return out;
  }

  // Modifies string so that variables passed in object are updated
  setVariables = function(string, variables) {
    var sorted = [], lines = [];
    // TODO: This is temporary solution that just re-generates whole file
    for (var variableName in variables) {
      if (variables.hasOwnProperty(variableName)) {
        sorted.push(variableName);
      }
    }
    sorted.sort();
    for (var i = 0; i < sorted.length; i++) {
      lines.push('$' + sorted[i] + ': ' + variables[sorted[i]] + ';');
    }
    return lines.join('\n');
  }

  return {
    parseVariables: parseVariables,
    setVariables: setVariables
  }
}
