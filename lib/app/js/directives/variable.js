'use strict';

angular.module('sgApp')
  .directive('sgVariable', function(Variables) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/variable.html',
      link: function(scope) {
        scope.isColor = function(value) {
          if (/^(#|rgb)/.test(value)) return true;
          return false;
        }
      }
    };
  });
