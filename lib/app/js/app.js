'use strict';

angular.module('sgApp', [
  'ui.router',
  'ngAnimate'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('index', {
        controller: 'MainCtrl',
        templateUrl: 'views/main.html'
      })
      .state('index.overview', {
        url: '/overview',
        templateUrl: 'overview.html',
        controller: function($rootScope) {
          $rootScope.currentSection = 'overview'
        }
      })
      .state('index.section', {
        url: '/:section',
        templateUrl: 'views/sections.html',
        controller: 'SectionsCtrl'
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
    };
  })
  .filter('decodeHtml', function() {
    return function(string) {
      var map = {
        '&amp;': '&',
        '&gt;': '>',
        '&lt;': '<',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'"
      };

      for (var m in map) {
        string = string.replace(new RegExp(m, 'gim'), map[m]);
      }

      return string;
    };
  });