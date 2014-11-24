'use strict';

angular.module('sgApp')
  .directive('sgSection', function($rootScope, $window, $timeout) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function(scope, element, attrs) {
        function updateCurrentReference() {
          var topOffset = element[0].offsetTop,
            bottomOffset = element[0].offsetTop + element[0].offsetHeight,
            buffer = 100;

          if (this.pageYOffset > topOffset - buffer && this.pageYOffset < bottomOffset - buffer) {
            if ($rootScope.currentReference.section.reference !== scope.section.reference) {

              // Assign new current section
              $rootScope.currentReference.section = scope.section;
              if (!scope.$$phase) {
                $rootScope.$apply();
              }
            }
          }
        }

        // Init markup visibility based on global setting
        scope.section.showMarkup = scope.markupSection.isVisible;
        // By default do not show CSS markup
        scope.section.showCSS = false;

        // Listen to scroll events and update currentReference if this section is currently focused
        angular.element($window).bind('scroll', function() {
          updateCurrentReference();
        });

        scope.$watch('search.$', function(newVal, oldVal) {
          // Search is not processed completely yet
          // We want to run updateCurrentReference after digest is complete
          $timeout(function() {
            updateCurrentReference();
          });
        });

        // Section location will change still after initialzation
        // We want to run updateCurrentReference after digest is complete
        $timeout(function() {
          updateCurrentReference();
        });
      }
    };
  });
