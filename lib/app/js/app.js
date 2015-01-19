angular.module('sgApp', [
  'ui.router',
  'ngAnimate',
  'colorpicker.module',
  'hljs',
  'LocalStorageModule',
  'oc.lazyLoad',
  'ngProgress',
  'rt.debounce'
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
        url: '/',
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
        url: '/section/:section',
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
        url: '/section/:section/fullscreen',
        templateUrl: 'views/element-fullscreen.html',
        controller: 'ElementCtrl',
        resolve: {
          loadLazyModule: function($ocLazyLoad) {
            if (window.filesConfig && window.filesConfig.length) {
              return $ocLazyLoad.load(window.filesConfig[0].name);
            }
          }
        }
      }).state('app.index.404', {
        url: '/:all',
        templateUrl: 'views/404.html'
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
      if (Styleguide.config && Styleguide.config.data && Styleguide.config.data.commonClass) {
        return '<sg-common-class-wrapper class="' + Styleguide.config.data.commonClass + '">' + html + '</sg-common-class-wrapper>';
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
    return function(variables, sectionVariableNames) {
      var filtered = [];
      angular.forEach(variables, function(variable) {
        if (sectionVariableNames && sectionVariableNames.indexOf(variable.name) > -1) {
          filtered.push(variable);
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
