angular.module('sgApp', [
  'ui.router',
  'ngAnimate',
  'colorpicker.module',
  'hljs',
  'LocalStorageModule',
  'oc.lazyLoad',
  'ngProgress'
])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider, $ocLazyLoadProvider) {
    $stateProvider
      .state('app', {
        template: '<ui-view />',
        controller: 'AppCtrl',
        abstract: true
      })
      .state('app.index', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('app.index.overview', {
        url: '/overview',
        templateUrl: 'overview.html',
        controller: function($rootScope, Styleguide) {
          $rootScope.currentSection = 'overview';
          // Update current reference to update the designer tool view
          $rootScope.currentReference.section = {
            header: 'Overview',
            reference: ''
          };

          $rootScope.$watch(function() {
            return Styleguide.config.data;
          }, function(newVal) {
            if (newVal) {
              $rootScope.pageTitle = newVal.title;
            }
          });
        }
      })
      .state('app.index.section', {
        url: '/:section',
        templateUrl: 'views/sections.html',
        controller: 'SectionsCtrl',
        resolve: {
          loadLazyModule: function($ocLazyLoad) {
            if (window.filesConfig && window.filesConfig.length) {
              return $ocLazyLoad.load(window.filesConfig[0].name);
            }
          }
        }
      })
      .state('app.index.variable', {
        url: '/variable/:variableName',
        templateUrl: 'views/variable-sections.html',
        controller: 'VariablesCtrl',
        resolve: {
          loadLazyModule: function($ocLazyLoad) {
            if (window.filesConfig && window.filesConfig.length) {
              return $ocLazyLoad.load(window.filesConfig[0].name);
            }
          }
        }
      })
      .state('app.fullscreen', {
        url: '/:section/fullscreen',
        templateUrl: 'views/element-fullscreen.html',
        controller: 'ElementCtrl',
        resolve: {
          loadLazyModule: function($ocLazyLoad) {
            if (window.filesConfig && window.filesConfig.length) {
              return $ocLazyLoad.load(window.filesConfig[0].name);
            }
          }
        }
      });

    $locationProvider.html5Mode(true);

    localStorageServiceProvider.setPrefix('sgLs');

    $ocLazyLoadProvider.config({
      events: true,
      debug: true,
      modules: window.filesConfig
    });
  })
  .run(function($rootScope) {
    $rootScope.currentReference = {
      section: {
      }
    };
  })
  .filter('addWrapper', ['Styleguide', function(Styleguide) {
    return function(html) {
      var cls = Styleguide.config.data.commonClass;
      if (cls) {
        return '<sg-custom-wrapper class="' + cls + '">' + html + '</sg-custom-wrapper>';
      }
      return html;
    };
  }])
  // Trust modifier markup to be safe html
  .filter('unsafe', ['$sce', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  }])
  .filter('filterRelated', function() {
    return function(items, relatedVariables) {
      var filtered = [];
      angular.forEach(items, function(item) {
        if (relatedVariables && relatedVariables.indexOf(item.name) > -1) {
          filtered.push(item);
        }
      });
      return filtered;
    };
  })
  // Replaces modifier markup's {$modifiers} with modifier's modifierClass
  .filter('setModifierClass', function() {
    return function(items, modifierClass) {
      items = items.replace(/\{\$modifiers\}/g, modifierClass);
      return items;
    };
  })
  // Replace $variables with values found in variables object
  .filter('setVariables', function() {
    return function(str, variables) {
      if (!str) {
        return '';
      }
      angular.forEach(variables, function(variable) {
        str = str.replace(new RegExp('\\$' + variable.name, 'g'), variable.value);
      });
      return str;
    };
  });
