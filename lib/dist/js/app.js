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
'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function ($scope, $location, $state, $rootScope,
    Styleguide) {

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data.sections;
        console.log(data.settings);
        generateCss();
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    // Generate css-classes for pseudo-selectors and insert them to <head>
    // TODO: Copied from kss-node, try custom solution at some point
    function generateCss() {
      var KssStateGenerator;

      KssStateGenerator = (function() {
        var pseudo_selectors;

        pseudo_selectors = ['hover', 'enabled', 'disabled', 'active', 'visited',
         'focus', 'target', 'checked', 'empty', 'first-of-type', 'last-of-type',
          'first-child', 'last-child'];

        function KssStateGenerator() {
          var idx, idxs, pseudos, replaceRule, rule, stylesheet, _i, _len, _len2, _ref, _ref2;
          pseudos = new RegExp("(\\:" + (pseudo_selectors.join('|\\:')) + ")", "g");
          try {
            _ref = document.styleSheets;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              stylesheet = _ref[_i];
              if (stylesheet.href && stylesheet.href.indexOf(document.domain) >= 0) {
                idxs = [];
                _ref2 = stylesheet.cssRules;
                for (idx = 0, _len2 = _ref2.length; idx < _len2; idx++) {
                  rule = _ref2[idx];
                  if ((rule.type === CSSRule.STYLE_RULE) && pseudos.test(rule.selectorText)) {
                    replaceRule = function(matched, stuff) {
                      return matched.replace(/\:/g, '.pseudo-class-');
                    };
                    this.insertRule(rule.cssText.replace(pseudos, replaceRule));
                  }
                  pseudos.lastIndex = 0;
                }
              }
            }
          } catch (_error) {}
        }

        KssStateGenerator.prototype.insertRule = function(rule) {
          var headEl, styleEl;
          headEl = document.getElementsByTagName('head')[0];
          styleEl = document.createElement('style');
          styleEl.type = 'text/css';
          if (styleEl.styleSheet) {
            styleEl.styleSheet.cssText = rule;
          } else {
            styleEl.appendChild(document.createTextNode(rule));
          }
          return headEl.appendChild(styleEl);
        };

        return KssStateGenerator;

      })();

      new KssStateGenerator;
    }
  });
angular.module('sgApp')
  .controller('SectionsCtrl', function ($scope, $stateParams, $location, $state,
    $rootScope, Styleguide) {

    if ($stateParams.section) {
      $scope.currentSection = $stateParams.section;
      $rootScope.currentSection = $scope.currentSection;
    } else {
      $location.url('overview');
    }

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    // Check section level (main/sub/sub-sub/sub-sub-sub)
    $scope.getLevel = function(section) {
      if ( /([0-9]\.[0-9]\.[0-9]\.)/.test(section.reference) ) {
        return 'sub-sub-sub';
      }
      if ( /([0-9]\.[0-9]\.)/.test(section.reference) ) {
        return 'sub-sub';
      }
      if ( /([0-9]\.)/.test(section.reference) ) {
        return 'sub';
      }
      return 'main';
    }

    $scope.filterSection = function(section) {
      if ($scope.currentSection === 'all') return true;
      var re = new RegExp('(^' + $scope.currentSection + '$)|(^' + 
        $scope.currentSection + '\\.)');
      return re.test(section.reference);
    }

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data.sections;
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });
  });
'use strict';

angular.module('sgApp')
  .directive('sgDesign', function () {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/design.html',
      link: function () {
        
      }
    };
  });
'use strict';

angular.module('sgApp')
  .directive('sgSection', function () {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/section.html',
      link: function () {
        
      }
    };
  });
'use strict';

angular.module('sgApp')
  .factory('Socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });
/*
 * Styleguide.js
 *
 * Handles styleguide data
 */

'use strict';

angular.module('sgApp')
  .factory('Styleguide', function ($http) {
    function get() {
      return $http({
          method: 'GET',
          url: 'styleguide.json'
        });
    }

    return {
      get: get
    };
  });