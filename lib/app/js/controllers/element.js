angular.module('sgApp')
  .controller('ElementCtrl', function($scope, $rootScope, $stateParams, $state, Styleguide, Variables, $filter) {

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

    function updatePageData() {
      var sections, result, element, modifierStr;
      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(item) {
        return reference === item.reference;
      });

      if (result.length > 0) {
        element = result[0];

        // Set page title
        if (Styleguide.config.data) {
          modifierStr = modifier ? '-' + modifier.toString() : '';
          $rootScope.pageTitle = element.reference + modifierStr + ' ' + element.header + ' - ' + Styleguide.config.data.title;
        }

        // Select correct modifier element if one is defined
        if (modifier) {
          element = element.modifiers[modifier - 1];
        }

        // Set the actual page content
        $scope.previousSection = previousSection(sections, result);
        $scope.nextSection = nextSection(sections, result);
        $scope.section = element;
        $scope.variables = Variables.variables;
        $scope.markup = $filter('setVariables')($filter('setModifierClass')(element.wrappedMarkup, element.className), $scope.variables);
      }
    }
  });
