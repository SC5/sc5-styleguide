'use strict';

angular.module('sgAppTest')
  .controller('sgAppTest', function($scope) {
    $scope.clickCount = 0;
    $scope.incrementClicks = function() {
      $scope.clickCount += 1;
    };
  })
  .directive('sgTestDirectiveTwo', function() {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'demo/testDirective.html'
    };
  });
