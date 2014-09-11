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
'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function ($scope, $stateParams, $location, Styleguide) {

    $scope.currentSection;
    if ($stateParams.section.length) {
      $scope.currentSection = $stateParams.section;
    } else {
      $location.url('overview');
    }

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data;
        generateCss();
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    $scope.filterSection = function(section) {
      if ($scope.currentSection === 'all') return true;
      var re = new RegExp('(^' + $scope.currentSection + ')');
      return re.test(section.reference);
    }

    // Generate css-classes for pseudo-selectors
    // TODO: Copied from kss-node, try custom solution at some point
    function generateCss() {
      var KssStateGenerator;

      KssStateGenerator = (function() {
        var pseudo_selectors;

        pseudo_selectors = ['hover', 'enabled', 'disabled', 'active', 'visited', 'focus', 'target', 'checked', 'empty', 'first-of-type', 'last-of-type', 'first-child', 'last-child'];

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
'use strict';

angular.module('sgApp')
  .directive('sgMarkup', function () {
    return {
      replace: true,
      restrict: 'A',
      template: '<div></div>',
      scope: {
        markup: '='
      },
      link: function (scope, el, attrs) {
        el.html(attrs.markup).show();
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