'use strict';

angular.module('sgApp')
  .directive('sgSection', ['$rootScope', function($rootScope) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function(scope, element, attrs) {

        // Init setting based on global 'showAllMarkup' value
        scope.section.showMarkup = scope.markup.isVisible;
        // By default do not show CSS markup
        scope.section.showCSS = false;

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

        scope.showSingleCSSBox = function(index) {
          if (!scope.section.showCSS) {
            scope.section.showCSS = true;
          }
        }

        scope.hideSingleCSSBox = function(index) {
          if (scope.section.showCSS) {
            scope.section.showCSS = false;
          }
        }
      }
    };
  }]);
