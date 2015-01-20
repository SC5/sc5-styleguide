'use strict';

var css = require('css'),
    _ = require('lodash');

module.exports.stylesFromString = function(cssString, options) {
  var ast, pseudoRules = [];

  function pseudoMatcher() {
    var pseudoSelectors = [
      'hover', 'enabled', 'disabled', 'active', 'visited',
      'focus', 'target', 'checked', 'empty', 'first-of-type', 'last-of-type',
      'first-child', 'last-child'
    ],
      notInsideParentheses = '(?![^(]*\\))';
    // Match all pseudo selectors that are not inside parentheses
    return new RegExp('(\\:' + (pseudoSelectors.join(notInsideParentheses + '|\\:')) + notInsideParentheses + ')', 'g');
  }

  try {
    ast = css.parse(cssString, options);
  } catch (err) {
    console.error('An error occurred when creating pseudo styles:', err.toString());
  }

  _.each(ast.stylesheet.rules, function(rule) {
    // Get only selectors that have pseudo selector
    rule.selectors = _.filter(rule.selectors, function(selector) {
      return pseudoMatcher().test(selector);
    });
    // Replace selector pseudo class with actual class
    if (rule.selectors.length > 0) {
      rule.selectors = _.map(rule.selectors, function(selector) {
        return selector.replace(pseudoMatcher(), function(matched) {
          return matched.replace(/\:/g, '.pseudo-class-');
        });
      });
      pseudoRules.push(rule);
    }
  });
  ast.stylesheet.rules = pseudoRules;
  return css.stringify(ast);
};
