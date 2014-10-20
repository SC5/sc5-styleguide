angular.module('sgApp', [
  'ui.router',
  'ngAnimate',
  'colorpicker.module',
  'hljs',
  'LocalStorageModule',
  'oc.lazyLoad'
])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider, $ocLazyLoadProvider) {
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
        controller: 'SectionsCtrl',
        resolve: {
          loadLazyModule: function($ocLazyLoad) {
            return $ocLazyLoad.load('testModule').then(function(response) {
              //console.log(response);
            });
          }
        }
      })
      .state('fullscreen', {
        url: '/:section/fullscreen',
        templateUrl: 'views/element-fullscreen.html',
        controller: 'ElementCtrl'
      });

    $locationProvider.html5Mode(true);

    localStorageServiceProvider.setPrefix('sgLs');

    // $ocLazyLoadProvider.config({
    //   events: true,
    //   debug: true,
    //   modules: [
    //     {
    //       name: 'lazyApp',
    //       files: [
    //         'lazy/app/scripts/app.js',
    //         'lazy/app/scripts/controllers/about.js',
    //         'lazy/app/scripts/controllers/main.js',
    //         'lazy/app/styles/main.css',
    //         'lazy/bower_components/bootstrap/dist/css/bootstrap.css',
    //         'lazy/bower_components/bootstrap/dist/js/bootstrap.js',
    //         'lazy/bower_components/angular-route/angular-route.js'
    //       ],
    //       template: 'lazy/templates/testi.html'
    //     }
    //   ]
    // });

    $ocLazyLoadProvider.config({
      events: true,
      debug: true,
      modules: window.filesConfig
    });
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
  });
