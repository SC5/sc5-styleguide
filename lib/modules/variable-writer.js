'use strict';

var gonzales = require('gonzales-pe'),
  traversers = {
    sass: function(node, variable) {
      if (node.type === 'declaration') {
        var isThisVariable = false;
        node.map(function(nnode) {
          if (nnode.type === 'variable') {
            nnode.map(function(nnnode) {
              if (nnnode.type === 'ident' && nnnode.content === variable.name) {
                isThisVariable = true;
              }
            });
          }
        });
        if (isThisVariable) {
          node.map(function(nnode) {
            if (nnode.type === 'value' && nnode.content[0].type !== 'variable') {
              nnode.content = [{
                type: 'string',
                content: variable.value
              }];
            }
          });
        }
      }
    },
    less: function(node, variable) {
      /* Processes the variables declared as atrules
        * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */
      if (node.type === 'atrules') {
        var hasOperator = false,
          isThisVariable = false,
          metOperator = false,
          metFirstSpace = false,
          newContent = [];
        node.map(function(nnode) {
          if (nnode.type === 'ident' && nnode.content === variable.name) {
            isThisVariable = true;
          }
          if (nnode.type === 'operator' && nnode.content === ':') {
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
          if (node.type === 'operator') {
            metOperator = true;
          }
          newContent.push(node);
          if (node.type === 'space' && metOperator) {
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
  };
traversers.scss = traversers.sass;

module.exports = {
  setVariables: function setVariables(string, syntax, variables) {
    var traverser = traversers[syntax],
      ast = gonzales.parse(string, {
        syntax: syntax
      });

    variables.forEach(function(variable) {
      ast.map(function(node) {
        return traverser(node, variable);
      });
    });

    return ast.toCSS(syntax);
  }
};
