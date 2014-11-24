'use strict';

angular.module('sgApp')
  .directive('sgVariable', function(Variables) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/variable.html',
      link: function(scope) {
        var colorRegex = /#[0-9a-f]{3,6}/i;
        scope.color = {};
        scope.hasColor = function(value) {
          return colorRegex.test(value);
        }

        // Parse first color from the string
        scope.$watch(function() {
          return scope.variable.value;
        }, function(newVal, oldVal) {
          var match = colorRegex.exec(newVal);
          if (match) {
            scope.color.value = match[0];
          }
        });

        // Set changed color back to the string
        scope.$watch(function() {
          return scope.color.value;
        }, function(newVal, oldVal) {
          scope.variable.value = scope.variable.value.replace(colorRegex, newVal);
        });
      }
    };
  });
