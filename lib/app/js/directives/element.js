'use strict';

angular.module('sgApp')
  .directive('sgElement', function($rootScope) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/element.html',
      link: function(scope, element, attrs) {

      }
    };
  });
