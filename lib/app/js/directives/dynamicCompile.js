'use strict';

angular.module('sgApp')
  .directive('dynamicCompile', function($compile, $parse, $window) {
    return {
      link: function(scope, element, attrs) {
        var parsed = $parse(attrs.ngBindHtml);
        function getStringValue() { return (parsed(scope) || '').toString(); }
        // Recompile if the template changes
        scope.$watch(getStringValue, function() {
          $compile(element, null, 0)(scope);
          // Emit an event that an element is rendered
          element.ready(function() {
            var event = new CustomEvent('styleguide:onRendered', {
              detail: {
                elements: element
              },
              bubbles: true,
              cancelable: true
            });
            $window.dispatchEvent(event);
          });
        });
      }
    };
  });
