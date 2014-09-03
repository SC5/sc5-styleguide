'use strict';

angular.module('sgApp', [
  'ui.router'
  ])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('index', {
        url: '/',
        controller: 'MainCtrl',
        templateUrl: '/views/main.html'
      });

    $urlRouterProvider.otherwise('/');
  })
  .filter('unsafe', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  });