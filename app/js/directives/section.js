angular.module('sgApp')
  .directive('sgSection', function () {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function () {
        
      }
    };
  });