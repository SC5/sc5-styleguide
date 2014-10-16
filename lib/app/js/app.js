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
      })
      .state('fullscreen', {
        url: '/:section/:element/fullscreen',
        templateUrl: 'views/element-fullscreen.html'

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
        var re = new RegExp('(\\w+?):\\s*\\$' + variable),
          match = item.match(re);
        if (match) {
          item = item.slice(0, match.index) + match[1] + ':' + variables[variable] + ';' + item.slice(match.index, item.length);
        }
      }
      return item;
    };
  })
  .filter('decodeHtml', function() {
    return function(string) {

      string = string || '';

      var map = {
        '&amp;': '&',
        '&gt;': '>',
        '&lt;': '<',
        '&quot;': '"',
        '&#39;': '\'',
        '&apos;': '\''
      };

      for (var m in map) {
        string = string.replace(new RegExp(m, 'gim'), map[m]);
      }

      return string;
    };
  });
