'use strict';

angular.module('sgApp', [
  'ui.router'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('index', {
        url: '/:section',
        controller: 'MainCtrl',
        templateUrl: 'views/main.html'
      });

    $locationProvider.html5Mode(true);
  })
  // Trust modifier markup to be safe html
  .filter('unsafe', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  })
  // Replaces modifier markup's {$modifiers} with modifier's modifierClass
  .filter('setModifierClass', function() {
    return function(items, modifierClass) {
      items.replace(/\{\$modifiers\}/, modifierClass);
      return items;
    }
  });