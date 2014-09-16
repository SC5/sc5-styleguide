'use strict';

angular.module('sgApp')
  .directive('sgDesign', function () {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/design.html',
      link: function () {
        
      }
    };
  });