'use strict';

angular.module('sgApp')
  .directive('sgSection', function ($rootScope) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function () {
        
      }
    };
  });