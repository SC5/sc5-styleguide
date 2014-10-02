'use strict'

angular.module('sgApp')
  .directive('testDirective', function($timeout){
    return {
    restrict: 'A',
    template: '<div>This is a test of dynamically injecting a directive into SG</div>',
    link: function($scope, iElm, iAttrs, controller) {

    }
  };
});