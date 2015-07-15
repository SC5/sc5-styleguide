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
              value: nodes.content[3].toCSS(syntax),
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
    traverser.traverse(ast, {
      // Visitor for SASS, SCSS and plain CSS syntaxes
      test: function(name, nodes) {
        return name === 'declaration' && nodes.content[0].content[0].type === 'variable';
      },
      process: function(nodes) {
        var varName = nodes.content[0].content[0].content[0].content;
        if (varName === variable.name && nodes.content[3]) {
          nodes.content[3].content = variable.value;
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
