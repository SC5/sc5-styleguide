'use strict';

var css = require('css');

module.exports = {
  stylesFromString: function(string) {
    var ast = css.parse(string);

    ast.stylesheet.rules = ast.stylesheet.rules.filter(function(rule) {
      return rule.type === 'keyframes' || rule.type === 'font-face';
    });

    return css.stringify(ast);
  }
};
