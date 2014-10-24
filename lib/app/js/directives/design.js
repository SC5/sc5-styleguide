'use strict';

angular.module('sgApp')
  .directive('sgDesign', function($rootScope, Variables) {
    return {
      replace: true,
      restrict: 'A',
      scope: {
        cfg: '='
      },
      templateUrl: 'views/partials/design.html',
      link: function(scope) {
        scope.onChange = function(key, value) {
          Variables.setValue(key, value);
        };

        scope.saveVariables = function() {
          Variables.saveVariables();
        }

        scope.isColor = function(value) {
          if (/^(#|rgb)/.test(value)) return true;
          return false;
        }
      }
    };
  });
