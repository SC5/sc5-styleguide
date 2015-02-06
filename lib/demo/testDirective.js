'use strict';

// Test directive is used to demo lazy loading external directive in the test project

angular.module('sgAppTest', [])
  .controller('sgAppTest', function($scope, $element) {
    $scope.alert = function() {
      $element[0].innerHTML = 'You have clicked!';
    };
  })
  .directive('sgTestDirective', function() {
    console.log(document.getElementById('socketDisconnection'));
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'demo/testDirective.html'
    };
  });
