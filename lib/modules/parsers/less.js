var gonzales = require('gonzales-pe');

// Parse Style variables to object
function parseVariableDeclarations(string) {

  // Do not parse empty files. Otherwise gonzales.parse will fail
  if (!string) {
    return [];
  }

  var out = [],
      ast = gonzales.parse(string, {
        syntax: 'less'
      });
  // Exclude functions arguments
  ast.traverse(function(node, index, parent) {
    if (node.is('arguments')) {
      parent.removeChild(index);
    }
  });
  ast.traverseByType('declaration', function(decl) {
    // Only consider @variable: value declarations
    var varName,
        varFullName,
        varVal = '',
        varLine = 1;
    decl.traverseByType('variable', function(varNode) {
      varName = varNode.content.toString();
      varFullName = varNode.toString();
      decl.traverseByType('value', function(valNode) {
        varVal = valNode.toString();
        varLine = valNode.start.line;
      });
      if (varFullName !== varVal) {
        out.push({
          name: varName,
          value: varVal.trim(),
          line: varLine
        });
      }
    });
  });
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
      });

  ast.traverseByType('value', function(subAst) {
    subAst.traverseByType('variable', function(node) {
      out.push(node.content.toString());
    });
  });

  return out;
}

function setVariables(string, variables) {

  var ast = gonzales.parse(string, {
    syntax: 'less'
  });

  variables.forEach(function(variable) {

    ast.traverseByType('declaration', function(decl) {
      // Only consider @variable: value declarations
      var varName,
          varFullName,
          varVal = '';
      decl.traverseByType('variable', function(varNode) {
        varName = varNode.content.toString();
        varFullName = varNode.toString();
        decl.traverseByType('value', function(valNode) {
          varVal = valNode.toString();
        if (varName !== variable.name) {
          return;
        }
        if (varFullName === varVal) {
          return;
        }
        // Skip functions
        if (valNode.contains('function')) {
          return;
        }
        var newVal = gonzales.createNode({ type: 'string', content: variable.value, syntax: 'less' });
        valNode.content = [newVal];
        });
      });
    });

  });
  return ast.toString();
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  findVariables: findVariables,
  setVariables: setVariables
};
