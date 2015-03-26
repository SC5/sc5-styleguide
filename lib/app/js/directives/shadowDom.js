'use strict';

angular.module('sgApp')
  .directive('shadowDom', function($templateCache) {

    var USER_STYLES_TEMPLATE = 'userStyles.html';

    return {
      restrict: 'E',
      transclude: true,
      link: function(scope, element, attrs, controller, transclude) {
        if (typeof element[0].createShadowRoot === 'function') {
          var root = angular.element(element[0].createShadowRoot());
          var stylesTemplate = $templateCache.get(USER_STYLES_TEMPLATE);
          var scriptsTemplate = '<script src="/styleguide.js"></script>'
          root.append(stylesTemplate + scriptsTemplate);
          transclude(function(clone) {
            root.append(clone);
          });
        } else {
          transclude(function(clone) {
            element.append(clone);
          });
        }
      }
    };
  });
