'use strict';

// Test directive is used to demo lazy loading external directive in the test project

angular.module('sgAppTest', [])
  .directive('sgTestDirective', function() {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'demo/testDirective.html'
    };
  });
