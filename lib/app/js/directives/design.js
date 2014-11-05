'use strict';

angular.module('sgApp')
  .directive('sgDesign', ['Variables', function(Variables) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/design.html',
      link: function(scope) {
        scope.onChange = function(key, value) {
          Variables.setValue(key, value);
        };

        scope.variables = Variables.variables;

        scope.variablesInOrder = Object.keys(Variables.variables).sort(function(keyA, keyB) {
          return Variables.variables[keyA].index - Variables.variables[keyB].index;
        });

        scope.saveVariables = function() {
          Variables.saveVariables();
        };

        scope.resetLocal = function() {
          Variables.resetLocal();
        }

        scope.isColor = function(value) {
          if (/^(#|rgb)/.test(value)) return true;
          return false;
        }
      }
    };
  }]);
