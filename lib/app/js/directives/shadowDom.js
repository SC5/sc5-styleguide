'use strict';

angular.module('sgApp')
  .directive('shadowDom', function(Styleguide, $templateCache) {

    var USER_STYLES_TEMPLATE = 'userStyles.html';

    return {
      restrict: 'E',
      transclude: true,
      link: function(scope, element, attrs, controller, transclude) {

        scope.$watch(function() {
          return Styleguide.config;
        }, function() {
          if (typeof element[0].createShadowRoot === 'function' && (Styleguide.config && Styleguide.config.data && !Styleguide.config.data.disableEncapsulation)) {
            angular.element(element[0]).empty();
            var root = angular.element(element[0].createShadowRoot());
            root.append($templateCache.get(USER_STYLES_TEMPLATE));
            transclude(function(clone) {
              root.append(clone);
            });
          } else {
            transclude(function(clone) {
              var root = angular.element(element[0]);
              root.empty();
              root.append(clone);
            });
          }
        }, true);

      }
    };
  });
