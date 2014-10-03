angular.module('sgApp', [
  'ui.router',
  'ngAnimate',
  'colorpicker.module',
  'hljs',
  'LocalStorageModule'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider) {
    $stateProvider
      .state('index', {
        controller: 'MainCtrl',
        templateUrl: 'views/main.html'
      })
      .state('index.overview', {
        url: '/overview',
        templateUrl: 'overview.html',
        controller: function($rootScope) {
          $rootScope.currentSection = 'overview';
        }
      })
      .state('index.section', {
        url: '/:section',
        templateUrl: 'views/sections.html',
        controller: 'SectionsCtrl'
      });

    $locationProvider.html5Mode(true);

    localStorageServiceProvider.setPrefix('sgLs');
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
      items = items.replace(/\{\$modifiers\}/, modifierClass);
      return items;
    };
  })
  //
  .filter('setVariables', function() {
    return function(item, variables) {
      for (var variable in variables) {
        var re3 = /(\w+?):\s*(\$.+?);/;
        var re = new RegExp('(\\w+?):\\s*\\$' + variable);
        var match = item.match(re);
        if (match) {
          var arr = item.slice(match.index);
          var item = item.slice(0, match.index) + match[1] + ':' + variables[variable] + ';' + item.slice(match.index, item.length);
        }
      }
      return item;
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
