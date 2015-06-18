var gonzales = require('gonzales-pe'),
    traverser = require('./ast-traverser');

// Parse Style variables to object
function parseVariableDeclarations(string) {
  // Do not parse empty files. Otherwise gonzales.parse will fail
  if (!string) {
    return [];
  }

  var out = [],
      ast = gonzales.parse(string, {
        syntax: 'less'
      }),
      visitor = {
        // Visitor for SASS, SCSS and plain CSS syntaxes
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
              varVal += element.toCSS('less'); // Syntax is always less as this visitor is only for LESS
            });

            out.push({
              name: varName,
              value: varVal.trim(),
              line: nodes.content[1].start.line
            });
          }
        }
      };

  traverser.traverse(ast, visitor);
  return out;
}

// Parse Style variables to object
function findVariables(string) {
  // Do not parse empty files. Otherwise gonzales.parse will fail
  if (!string) {
    return [];
  }

  var out = [],
      ast = gonzales.parse(string, {
        syntax: 'less'
      }),
      visitor = {
        // Visitor for SASS, SCSS and plain CSS syntaxes
        test: function(name, nodes) {
          return (name === 'declaration' && nodes.content[0].content[0].type === 'variable') || (name === 'variable' && nodes.content[0].type === 'ident');
        },
        process: function(nodes) {
          if (nodes.type !== 'declaration') {
            out.push(nodes.content[0].content);
          }
        }
      };

  traverser.traverse(ast, visitor);
  return out;
}

function setVariables(string, variables) {

  var ast = gonzales.parse(string, {
    syntax: 'less'
  });

  variables.forEach(function(variable) {
    ast.map(function(node) {
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
    });
  });
  return ast.toCSS('less');
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  findVariables: findVariables,
  setVariables: setVariables
};
