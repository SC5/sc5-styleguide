'use strict';

angular.module('sgApp')
.directive('routeCssClass', function($rootScope) {
  return {
    restrict: 'A',
    scope: {},
    link: function (scope, elem) {
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        var fromClassnames = angular.isDefined(fromState.viewClass) && angular.isDefined(fromState.viewClass) ? fromState.viewClass : null;
        var toClassnames = angular.isDefined(toState.viewClass) && angular.isDefined(toState.viewClass) ? toState.viewClass : null;

        fromClassnames = 'root-' + fromClassnames;
        toClassnames = 'root-' + toClassnames;
        // don't do anything if they are the same
        if (fromClassnames !== toClassnames) {
          if (fromClassnames) {
            elem.removeClass(fromClassnames);
          }

          if (toClassnames) {
            elem.addClass(toClassnames);
          }
        }
      });
    }
  };
});
