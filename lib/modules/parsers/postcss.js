var postcss = require('postcss'),
  // A custom property is any property whose name starts with two dashes (U+002D HYPHEN-MINUS)
  // `--foo`
  // See: http://dev.w3.org/csswg/css-variables/#custom-property
  RE_VAR_PROP = (/(--(.+))/),
  RE_VAR_FUNC = (/var\((--[^,\s]+?)(?:\s*,\s*(.+))?\)/);

function cleanVariableName(name) {
  return name.replace(/^\-\-/, '');
}

function parseVariableDeclarations(string) {
  if (!string) {
    return [];
  }

  var out = [],
    ast = postcss.parse(string);
  // Loop through all of the declarations and grab the variables and put them in the map
  ast.eachDecl(function(decl) {
    // If declaration is a variable
    if (RE_VAR_PROP.test(decl.prop)) {
      out.push({
        name: cleanVariableName(decl.prop),
        value: decl.value,
        line: decl.source.start.line
      });
    }
  });
  return out;
}

function findVariables(string) {
  if (!string) {
    return [];
  }

  var out = [],
    ast = postcss.parse(string);

  ast.eachRule(function(rule) {
    rule.nodes.forEach(function(node) {
      if (node.type === 'decl') {
        var decl = node;
        if (RE_VAR_FUNC.test(decl.value) && !RE_VAR_PROP.test(decl.prop)) {
          out.push(cleanVariableName(decl.value.match(RE_VAR_FUNC)[1]));
        }
      }
    });
  });
  return out;
}

function setVariables(string, variables) {
  var ast = postcss.parse(string);
  // Loop through all of the declarations and change variable values
  variables.forEach(function(variable) {
    ast.eachDecl(function(decl) {
      // If declaration is a variable
      if (RE_VAR_PROP.test(decl.prop) && decl.prop === '--' + variable.name) {
        decl.value = variable.value;
      }
    });
  });
  return ast.toString();
}

function splitCodeAndCommentBlocks(string) {
  var ast = postcss.parse(string);
  var blocks = [];
  ast.nodes.forEach(function(node) {
    var block = {
      type: node.type === 'comment' ? 'comment' : 'code',
      content: node.toString()
    };
    blocks.push(block);
  });
  return blocks;
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  findVariables: findVariables,
  setVariables: setVariables,
  splitCodeAndCommentBlocks: splitCodeAndCommentBlocks
};
