'use strict';

var gonzales = require('gonzales-pe'),
    jspath = require('jspath'),
    gonzo = require('gonzales-ast'),
    path = require('path'),
    Q = require('q'),
    _ = require('lodash');

function astToSrc(ast, syntax) {
  return gonzales.astToSrc({
    ast: ast,
    syntax: syntax
  });
}

// Parse Style variables to object
function parseVariableDeclarations(string, syntax) {
  syntax = syntax || 'scss';

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      }),
      traversers = {
        sass: function(node) {
          var variable = {};

          if (node.type !== 'declaration') {
            return;
          }

          node.map(function(nnode){
            if (nnode.type === 'variable') {
              nnode.map(function(nnnode){
                if (nnnode.type === 'ident') {
                  variable.name = nnnode.content;
                }
              });
            }
            if (nnode.type === 'value') {
              variable.value = nnode.toCSS(syntax);
            }
          });
          out.push(variable);
        }
      },
      traverser;

  traversers.scss = traversers.sass;
  traverser = traversers[syntax];

  if (syntax === 'less') {
    // Skip at-keywords that do not decrade variable (Ex. @imports)
    var atRulesWithOperators = jspath.apply('..content{.type === "atrules" && ..content{.type === "operator" && .content === ":" }}', ast);
    /* Grabs all the listed values
    * Fix then https://github.com/tonyganch/gonzales-pe/issues/17 is fixed */
    atRulesWithOperators.forEach(function(atRule) {
      var variable = {};
      variable.name = jspath.apply('..content{.type == "atkeyword"}..content{.type == "ident"}.content', atRule).toString();

      atRule.content = atRule.content.filter(function(node) {
        if (node.type === "atkeyword") {
          return false;
        }
        if (node.type === "operator" && node.content === ":") {
          return false;
        }
        return node;
      });

      variable.value = atRule.toCSS(syntax).trim();

      out.push(variable)
    });
  } else {
    ast.map(traverser);
  }


  return out;
}

// Parse Style variables to object
function findVariables(string, syntax) {
  syntax = syntax || 'scss';

  var out = [],
      ast = gonzales.parse(string, {
        syntax: syntax
      });

  var out = jspath.apply('..content{.type === "value" }..content{.type === "variable" }..content{.type === "ident"}.content', ast);

  return out;
}

function parseVariableDeclarationsFromFiles(files) {
  var filePromises = Object.keys(files).map(function(filePath) {
    var contents = files[filePath],
        syntax = path.extname(filePath).substring(1);

    return Q.promise(function(resolve) {
      var fileVariables = parseVariableDeclarations(contents, syntax);
      // Map correct file name to every variable
      fileVariables.forEach(function(variable) {
        variable.file = filePath;
      });
      resolve(fileVariables);
    });
  });

  return Q.all(filePromises).then(function() {
    return _.chain(arguments).flatten().sortBy('file').value();
  });
}

function findModifierVariables(modifiers) {
  var out = [];
  if (modifiers) {
    modifiers.forEach(function(modifier) {
      if (/^[\@|\$]/.test(modifier.name)) {
        out.push(modifier.name.substring(1));
      }
    });
  }
  return out;
}

module.exports = {
  parseVariableDeclarations: parseVariableDeclarations,
  parseVariableDeclarationsFromFiles: parseVariableDeclarationsFromFiles,
  findVariables: findVariables,
  findModifierVariables: findModifierVariables
};
