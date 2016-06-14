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
      ast.traverseByType('atrule', function(node) {
          var varName,
            varVal = '',
            metOperator = false,
            varLine;
          node.forEach(function(atRuleNode) {
              if (atRuleNode.is('atkeyword')) {
                  varName = atRuleNode.content.toString();
                  varLine = atRuleNode.start.line;
                  return;
              }

              if(atRuleNode.is('operator') && atRuleNode.content === ':') {
                // Skip atRules without : operator
                metOperator = true;
                return;
              }

              if (metOperator === true) {
                varVal += atRuleNode.toString();
              }

          });
          if (varVal) {
            out.push({
              name: varName,
              value: varVal.trim(),
              line: varLine
            });
          }
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

  ast.traverseByType('variable', function(node) {
    out.push(node.content.toString());
  });

  return out;
}

function setVariables(string, variables) {

  var ast = gonzales.parse(string, {
    syntax: 'less'
  });

  variables.forEach(function(variable) {

    ast.traverseByType('atrule', function(node){
        var varName = '',
            wrongVar = false,
            metOperator = false,
            cleaned = false;

        if (wrongVar) {
            return;
        }

        node.forEach(function(atRuleNode){
            if (atRuleNode.type === 'atkeyword') {
                varName = atRuleNode.content.toString();
                if (varName !== variable.name) {
                    wrongVar = true;
                }
                return;
            }

            if(atRuleNode.is('operator') && atRuleNode.content === ':') {
                // Skip atRules without : operator
                metOperator = true;
                return;
            }

            if (metOperator && atRuleNode.is('space') && !cleaned) {
                return;
            }

            if (!wrongVar) {
                cleaned = true;
                atRuleNode.type = 'string';
                atRuleNode.content = '';
            }

        });
        if (!wrongVar) {
            var newVal = gonzales.createNode({ type: 'string', content: variable.value, syntax: 'less' });
            node.content.push(newVal);
        }
    });

  });
  return ast.toString();
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  findVariables: findVariables,
  setVariables: setVariables
};
