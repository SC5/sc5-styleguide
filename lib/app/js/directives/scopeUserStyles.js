'use strict';

angular.module('sgApp')
  .directive('sgScopeUserStyles', function() {
    return {
      link: function(scope, element) {
        var host = element[0],
            content = host.innerHTML;

        if (typeof host.createShadowRoot === 'function') {
          var root = host.createShadowRoot(),
              style = [
                '<style>',
                '@import url(\'styleguide.css\');',
                '@import url(\'styleguide_pseudo_styles.css\');',
                '@import url(\'css/styleguide_helper_elements.css\');',
                '</style>'
              ].join('\n');

          scope.$watch(function() {
            return element[0].innerHTML;
          }, function(newVal) {
            root.innerHTML = style + newVal;
          });
          root.innerHTML = style + content;
        } else {
          host.innerHTML = content;
        }
      }
    };
  });
