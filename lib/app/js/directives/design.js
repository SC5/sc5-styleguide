'use strict';

angular.module('sgApp')
  .directive('sgDesign', function ($rootScope) {
    return {
      replace: true,
      restrict: 'A',
      scope: {
        cfg: '='
      },
      templateUrl: 'views/partials/design.html',
      link: function (scope) {
        scope.onChange = function(key, value) {
          $rootScope.settings[key] = value;
        };

        scope.isColor = function(key) {
          if ( /color/.test(key) ) return true;
          return false;
        }
      }
    };
  });