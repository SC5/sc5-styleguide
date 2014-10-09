'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function($scope, $location, $state, $rootScope,
    Styleguide, Variables, localStorageService) {

    var socket;

    $scope.isNavCollapsed = false;

    //on page refresh check if all markup was hidden or not
    var showAllMarkup = localStorageService.get('showAllMarkup');

    //because localStorage only saves String type values, try to convert to boolean
    if (showAllMarkup == null) {
      $scope.showAllMarkup = true;
    } else {
      if (showAllMarkup == 'false') {
        $scope.showAllMarkup = false;
      } else {
        $scope.showAllMarkup = true;
      }
    }

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data.sections;
        $rootScope.settings = data.settings;
        generateCss();
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    // Toggle all markup boxes visible/hidden state
    $scope.toggleMarkup = function() {
      $scope.showAllMarkup = !$scope.showAllMarkup;
      for (var i = 0; i < $scope.sections.length; i++) {
        $scope.sections[i].showMarkup = $scope.showAllMarkup;
      }
      localStorageService.add('showAllMarkup', $scope.showAllMarkup);
    }

    // Change route to /all when searching
    $scope.$watch('search.$', function(newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        $location.url('all');
      };
    });

    // Clear search
    $scope.clearSearch = function() {
      if ($scope.search) {
        $scope.search = {};
      }
    }

    // Generate css-classes for pseudo-selectors and insert them to <head>
    // TODO: Copied from kss-node, try custom solution at some point
    function generateCss() {
      var KssStateGenerator;

      KssStateGenerator = (function() {
        var pseudoSelectors = [
          'hover', 'enabled', 'disabled', 'active', 'visited',
          'focus', 'target', 'checked', 'empty', 'first-of-type', 'last-of-type',
          'first-child', 'last-child'
        ];

        function KssStateGenerator() {
          var idx, idxs, pseudos, replaceRule, rule, stylesheet, _i, _len, _len2, _ref, _ref2;
          pseudos = new RegExp('(\\:' + (pseudoSelectors.join('|\\:')) + ')', 'g');
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

    $rootScope.saveVariables = function() {
      var saveToServer;
      if (Variables.getSocket()) {
        saveToServer = confirm('Save to server?');
      } else {
        saveToServer = false;
      }

      Variables.sync('save', saveToServer);

    };

  });
