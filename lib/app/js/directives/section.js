'use strict';

angular.module('sgApp')
  .directive('sgSection', ['$rootScope', function($rootScope) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function(scope, element, attrs) {

        //init setting based on global 'showAllMarkup' value
        scope.section.showMarkup = scope.markup.isVisible;

        scope.showSingleMarkupBox = function(index) {
          if (!scope.section.showMarkup) {
            scope.section.showMarkup = true;
          }
        }

        scope.hideSingleMarkupBox = function(index) {
          if (scope.section.showMarkup) {
            scope.section.showMarkup = false;
          }
        }
      }
    };
  }]);
