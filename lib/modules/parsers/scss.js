var gonzales = require('gonzales-pe'),
    traverser = require('./ast-traverser'),
    syntax = 'scss';

function setSyntax(newSyntax) {
  syntax = newSyntax;
}

// Parse Style variables to object
function parseVariableDeclarations(string) {
  // Do not parse empty files. Otherwise gonzales.parse will fail
  if (!string) {
    return [];
  }

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      }),
      visitor = {
        // Visitor for SASS, SCSS and plain CSS syntaxes
        test: function(name, nodes) {
          return name === 'declaration' && nodes.content[0].content[0].type === 'variable';
        },
        process: function(nodes) {
          var varName = nodes.content[0].content[0].content[0].content;
          if (nodes.content[3]) {
            out.push({
              name: varName,
              value: nodes.content[3].toCSS('scss'),
              line: nodes.content[3].start.line
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
        syntax: syntax
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
    syntax: syntax
  });

  variables.forEach(function(variable) {
    ast.map(function(node) {
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
    });
  });
  return ast.toCSS(syntax);
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  findVariables: findVariables,
  setVariables: setVariables,
  setSyntax: setSyntax
};
