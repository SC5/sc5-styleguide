'use strict';

// Test directive is used to demo lazy loading external directive in the test project

angular.module('sgAppTest', [])
  .controller('sgAppTest', function($scope) {
    $scope.clickCount = 0;
    $scope.incrementClicks = function() {
      $scope.clickCount += 1;
    };
  })
  .directive('sgTestDirective', function() {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'demo/testDirective.html'
    };
  });
