'use strict';

angular.module('sgApp')
  .directive('sgScopeUserStyles', function() {
    return {
      link: function(scope, element, attrs) {
        var raw = element[0];
        if (typeof raw.createShadowRoot !== 'function') return;
        var root = raw.createShadowRoot();
        root.innerHTML =
          '<style>' +
            '@import url(\'/scoped_styleguide.css\');' +
            '@import url(\'/scoped_styleguide_pseudo_styles.css\');' +
          '</style>' +
          '<content></content>';
      }
    };
  });
