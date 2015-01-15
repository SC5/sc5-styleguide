'use strict';

var gonzales = require('gonzales-pe'),
  gonzo = require('gonzales-ast'),
  processors = {
    sass: {
      createVisitor: function(variable) {
        return {
          test: function(name, nodes) {
            return name === 'declaration' && nodes[1][0] === 'variable' && nodes[1][1].indexOf(variable.name) !== -1;
          },
          process: function(node) {
            node[4] = ['value', variable.value];
            return node;
          }
        };
      }
    },
    less: {
      test: function(name) {
        return name === 'atrules';
      },
      createVisitor: function(variable) {
        return {
          test: processors.less.test,
          process: function(node) {
            var varName = node[1][1][1],
              savedSpace = false;

            /* Processes the variables declared as atrules
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
              if (varName === variable.name) {
                delete node[index];
              }
            });
            if (varName === variable.name) {
              node.push(['value', variable.value]);
            }
            return node;
          }
        };
      }
    }
  };
processors.scss = processors.sass;

module.exports = {
  setVariables: function setVariables(string, syntax, variables) {
    var processor = processors[syntax],
      visitors = variables.map(processor.createVisitor),
      src = gonzales.srcToAST({
        src: string,
        syntax: syntax
      }),
      result = gonzales.astToSrc({
        ast: gonzo.traverse(src, visitors),
        syntax: syntax
      });

    verifyResultIsValid(result, syntax);
    return result;
  }
};

// gonzales will throw an error if the src is not valid
function verifyResultIsValid(result, syntax) {
  gonzales.srcToAST({
    src: result,
    syntax: syntax
  });
}
