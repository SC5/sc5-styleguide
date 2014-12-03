'use strict';

angular.module('sgApp')
  .directive('sgScopeUserStyles', function($parse) {
    return {
      link: function(scope, element, attrs) {
        var parsed = $parse(attrs.sgScopeUserStyles),
            content = (parsed(scope) || '').toString(),
            host = element[0];

        if (typeof host.createShadowRoot === 'function') {
          var root = host.createShadowRoot(),
              style = [
                '<style>',
                '@import url(\'/styleguide.css\');',
                '@import url(\'/styleguide_pseudo_styles.css\');',
                '</style>'
              ].join('\n');
          root.innerHTML = style + content;
        } else {
          host.innerHTML = content;
        }
      }
    };
  });
