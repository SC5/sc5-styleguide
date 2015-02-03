'use strict';

var gonzales = require('gonzales-pe'),
  gonzo = require('gonzales-ast'),
  traversers = {
    sass: function(node, variable) {
      if (node.type === "declaration") {
        var isThisVariable = false;
        node.map(function(nnode) {
          if (nnode.type === "variable") {
            nnode.map(function(nnnode) {
              if (nnnode.type === "ident" && nnnode.content == variable.name) {
                isThisVariable = true;
              }
            })
          }
        });
        if (isThisVariable) {
          node.map(function(nnode) {
            if (nnode.type === "value") {
              nnode.content = [{
                type: 'string',
                content: variable.value
              }]
            }
          })
        }
      }
    },
    less: function(node, variable) {
      if (node.type === "atrules") {
        var hasOperator = false,
          isThisVariable = false,
          metOperator = false,
          metFirstSpace = false,
          newContent = [];
        node.map(function(nnode) {
          if (nnode.type === "ident" && nnode.content === variable.name) {
            isThisVariable = true;
          }
          if (nnode.type === "operator" && nnode.content === ":") {
            metOperator = true;
            hasOperator = true;
          }
        });
        // Take only at-rules with operators
        if (!hasOperator) {
          return;
        }
        // For given variable only
        if (!isThisVariable) {
          return;
        }
        node.content.forEach(function(node) {
          if (metOperator && metFirstSpace) {
            return;
          }
          if (node.type === "operator") {
            metOperator = true;
          }
          newContent.push(node);
          if (node.type === "s" && metOperator) {
            metFirstSpace = true;
          }
        });
        node.content = newContent;
        node.content.push({
          type: 'string',
          content: variable.value
        });
      }
    }
  },
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
traversers.scss = traversers.sass;

module.exports = {
  setVariables: function setVariables(string, syntax, variables) {
    var processor = processors[syntax],
      visitors = variables.map(processor.createVisitor),
      traverser = traversers[syntax],
      ast = gonzales.parse(string, {
        syntax: syntax
      });

    variables.forEach(function(variable) {
      ast.map(function(node){
        return traverser(node, variable);
      });
    });

    //console.log(JSON.stringify(ast, null, 4));
    return ast.toCSS(syntax);
  }
};
