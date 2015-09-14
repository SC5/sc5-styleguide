angular.module('sgApp')
  .controller('ElementCtrl', function($scope, $rootScope, $stateParams, $state, Styleguide, Variables, $filter, $location) {

    var section = $stateParams.section.split('-'),
      reference = section[0],
      modifier = section[1];

    $rootScope.$watch(function() {
      return Styleguide.sections.data;
    }, function() {
      updatePageData();
    });

    $rootScope.$watch(function() {
      return Styleguide.config.data;
    }, function() {
      updatePageData();
    });

    function previousSection(sections, result) {
      var sec, i, m;
      sec = result[0];
      m = modifier;
      if (result.length > 0) {
        if (!modifier || modifier <= 1) {
          i = sections.indexOf(result[0]) - 1;
          for (i; i >= 0; i--) {
            sec = sections[i];
            if (sec.hasOwnProperty('modifiers')) {
              if (sec.modifiers.length > 0) {
                break;
              } else if (sec.hasOwnProperty('markup') && sec.markup) {
                return sec.reference;
              }
            }
          }
          if (sec.hasOwnProperty('modifiers') && sec.modifiers.length > 0) {
            m = sec.modifiers.length + 1;
          } else {
            return false;
          }
        }
        return sec.reference + '-' + (parseInt(m) - 1);
      }
    }

    function nextSection(sections, result) {
      var sec, i, m;
      sec = result[0];
      m = modifier;
      if (result.length > 0) {
        if (!modifier || modifier >= sec.modifiers.length) {
          i = sections.indexOf(result[0]) + 1;
          for (i; i < sections.length; i++) {
            sec = sections[i];
            if (sec.hasOwnProperty('modifiers')) {
              if (sec.modifiers.length > 0) {
                m = 0;
                break;
              } else if (sec.hasOwnProperty('markup') && sec.markup) {
                return sec.reference;
              }
            }
          }
        }
        if (sec.modifiers.length === 0) {
          return false;
        }
        return sec.reference + '-' + (parseInt(m) + 1);
      }
    }

    function getSectionMarkup(section) {
      return $filter('setVariables')($filter('setModifierClass')(section.renderMarkup, section.className), $scope.variables);
    }

    function updatePageData() {
      var recursive = $location.search().recursive,
        separator = '<br>',
        sections, result, element, markup, modifierStr;

      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(section) {
        if (reference === 'all') {
          return true;
        }
        if (recursive) {
          return new RegExp('^' + reference + '(\\D|$)').test(section.reference);
        } else {
          return reference === section.reference;
        }
      });

      if (result.length > 0) {
        element = result[0];

        // Set page title
        if (Styleguide.config.data) {
          modifierStr = modifier ? '-' + modifier.toString() : '';
          $rootScope.pageTitle = element.reference + modifierStr + ' ' + element.header + ' - ' + Styleguide.config.data.title;
        }

        // Set the actual page content
        $scope.previousSection = previousSection(sections, result);
        $scope.nextSection = nextSection(sections, result);
        $scope.variables = Variables.variables;

        // Collect every component markup when using recursive mode
        if (recursive) {
          markup = '';
          angular.forEach(result, function(section) {
            if (section.modifiers && section.modifiers.length > 0) {
              // If section contains modifier, render every modifier
              angular.forEach(section.modifiers, function(modifier) {
                markup += getSectionMarkup(modifier) + separator;
              });
            } else {
              // Otherwise just render the element
              markup += getSectionMarkup(section) + separator;
            }
          });
        } else {
          // Select correct modifier element if one is defined
          if (modifier) {
            element = element.modifiers[modifier - 1];
          }
          markup = getSectionMarkup(element);
        }

        $scope.section = element;
        $scope.markup = markup;
      }
    }
  });
