'use strict';

angular.module('sgApp')
  .directive('shadowDom', function() {
    return {
      restrict: 'E',
      transclude: true,
      link: function(scope, element, attrs, controller, transclude) {
        if (typeof element[0].createShadowRoot === 'function') {
          var root = angular.element(element[0].createShadowRoot());
          transclude(function(clone) { root.append(clone); }, root);
        }
      }
    };
  });
