
 var css = require('css'),
  _ = require('lodash');

module.exports.stylesFromString = function(cssString) {

  function pseudoMatcher() {
    var pseudoSelectors = [
      'hover', 'enabled', 'disabled', 'active', 'visited',
      'focus', 'target', 'checked', 'empty', 'first-of-type', 'last-of-type',
      'first-child', 'last-child'
    ];
    return new RegExp('(\\:' + (pseudoSelectors.join('|\\:')) + ')', 'g');
  }

  function replacePseudoRule(matched) {
    return matched.replace(/\:/g, '.pseudo-class-');
  }

  var ast = css.parse(cssString, { source: 'source.css' }),
    pseudoRules = [];

  _.each(ast.stylesheet.rules, function(rule) {
    // Get only selectors that have pseudo selector
    rule.selectors = _.filter(rule.selectors, function(selector) {
      return pseudoMatcher().test(selector);
    });
    // Replace selector pseudo class with actual class
    if (rule.selectors.length > 0) {
      rule.selectors = _.map(rule.selectors, function(selector) {
        return selector.replace(pseudoMatcher(), function(matched, stuff) {
          return matched.replace(/\:/g, '.pseudo-class-');
        });
      });
      pseudoRules.push(rule);
    }
  });
  ast.stylesheet.rules = pseudoRules;
  return css.stringify(ast);
}
