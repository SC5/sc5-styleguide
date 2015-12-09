var gonzales = require('gonzales-pe'),
    traverser = require('./ast-traverser'),
    oldTraverser = require('../ast-traverser'),
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
              value: nodes.content[3].toString(syntax),
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

  return ast.toString(syntax);
}

function splitCodeAndCommentBlocks(source, syntax) {
    var ast = gonzales.parse(source, {
          syntax: syntax
        }),
        block,
        blocks = [],
        prevNode;

    oldTraverser.traverse(ast, [{
      // Visitor for SASS and SCSS syntaxes
      test: function(name) {
        return name !== 'stylesheet';
      },
      process: function(nodes) {
        var startNewBlock = function(position) {
          block && blocks.push(block);
          block = {
            type: '',
            position: position,
            content: ''
          };
        },
        type;
        // Calculate type of the current block
        // Multiline comment is comment
        if (nodes.type === 'multilineComment') {
          type = 'comment';
        }
        // Singleline comment is comment
        else if (nodes.type === 'singlelineComment') {
          type = 'comment';
        }
        // Single breaklines between singleline comments are comments
        else if (nodes.type === 'space' && nodes.content.split('\n').length <= 2 && prevNode && prevNode.type === 'singlelineComment') {
          type = 'comment';
        }
        else {
          type = 'code';
        }

        if (!block || block.type !== type) {
          startNewBlock(nodes.start);
        }
        // Extend current block content
        block.type = type;
        block.content += nodes.toString(syntax);
        prevNode = nodes;
      }
    }]);
    // push last block
    if (block) {
      blocks.push(block);
    }
    return blocks;
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  findVariables: findVariables,
  setVariables: setVariables,
  setSyntax: setSyntax,
  splitCodeAndCommentBlocks: splitCodeAndCommentBlocks
};
