'use strict';

angular.module('sgApp')
  .directive('sgVariable', function() {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/variable.html',
      link: function(scope) {
        var colorRegex = /#[0-9a-f]{3,6}/i;
        scope.color = {};

        function shorthandFormat(str) {
          if (str.length === 7 && str[0] === '#' && str[1] === str[2] && str[3] === str[4] && str[5] === str[6]) {
            return '#' + str[1] + str[3] + str[5];
          }
          return str;
        }

        function extendedFormat(str) {
          if (str.length === 4 && str[0] === '#') {
            return '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3];
          }
          return str;
        }

        function findColor(str) {
          var match = colorRegex.exec(str);
          if (match) {
            return match[0];
          }
        }

        scope.hasColor = function(value) {
          return colorRegex.test(value);
        };

        // Parse first color from the string
        scope.$watch(function() {
          return scope.variable.value;
        }, function() {
          var color = findColor(scope.variable.value);
          if (color) {
            // Store original format. This is needed when we store value back
            scope.color.useShorthand = (color.length === 4);
            // Since color picker does not support compact format we need to always extend it
            scope.color.value = extendedFormat(color);
          }
        });

        // Set changed color back to the string
        scope.$watch(function() {
          return scope.color.value;
        }, function(newVal) {
          var color = newVal;
          // If color was originally stored in the compact format try to convert it
          if (scope.color.useShorthand) {
            color = shorthandFormat(color);
          }
          scope.variable.value = scope.variable.value.replace(colorRegex, color);
        });
      }
    };
  });
