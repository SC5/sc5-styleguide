'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function($scope, $location, $state, $rootScope,
    Styleguide, Variables, localStorageService) {

    var socket;

    $scope.isNavCollapsed = false;

    // Because localStorage only saves String type values, try to convert to boolean
    $scope.checkIfMarkupVisible = function() {
      var showAllMarkup = localStorageService.get('showAllMarkup');
      if (showAllMarkup == null) {
        $scope.showAllMarkup = true;
      } else {
        if (showAllMarkup == 'false' || showAllMarkup === false) {
          $scope.showAllMarkup = false;
        } else {
          $scope.showAllMarkup = true;
        }
      }
    }

    $scope.checkIfMarkupVisible();

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data.sections;
        $rootScope.config = data.config;

        generateCss();
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });

    // Bind variable to scope to wait for data to be resolved
    $scope.variables = {};

    $scope.$watch(function() {
      return Variables.variables;
    }, function(newVal) {
      if (newVal) {
        $scope.variables = newVal;
      }
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

    $scope.$on('styles changed', function() {
      var links = document.getElementsByTagName('link');
      for (var l in links) {
        var link = links[l];
        if (typeof link === 'object' && link.getAttribute('type') === 'text/css') {
          link.href = link.href.split('?')[0] + '?id=' + new Date().getTime();
        }
      }
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
  });
