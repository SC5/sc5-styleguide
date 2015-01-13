'use strict';

var css = require('css');

module.exports = {
  stylesFromString: function(string, options) {
    var ast;

    try {
      ast = css.parse(string, options);
    } catch (err) {
      console.error('An error occurred when extracting at-rules:', err.toString());
    }

    ast.stylesheet.rules = ast.stylesheet.rules.filter(function(rule) {
      return rule.type === 'keyframes' || rule.type === 'font-face';
    });

    return css.stringify(ast);
  }
};
