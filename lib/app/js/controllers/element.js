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

    function previousSection() {
      var sections, result, mod, sec, i, m;
      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(item) {
        return reference === item.reference;
      });
      sec = result[0];
      m = modifier;
      if (result.length > 0) {
        if (!modifier || modifier <= 1) {
          if (sections.indexOf(result[0]) <= 0) {
            return false;
          } else {
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
            if (sec.modifiers.length > 0) {
              m = sec.modifiers.length + 1;
            } else {
              return false;
            }
          }
        }

        mod = sec.reference + '-' + (parseInt(m) - 1);
      }
      return mod;
    }

    function nextSection() {
      var sections, result, mod, sec, i, m;
      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(item) {
        return reference === item.reference;
      });
      sec = result[0];
      m = modifier;
      if (result.length > 0) {
        if (!modifier || modifier >= sec.modifiers.length) {
          if (sections.indexOf(result[0]) > sections.length) {
            return false;
          } else {
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
            if (sec.modifiers.length === 0) {
              return false;
            }
          }
        }

        mod = sec.reference + '-' + (parseInt(m) + 1);
      }
      return mod;
    }

    function updatePageData() {
      var sections, result, element;
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
          var modifierStr = modifier ? '-' + modifier.toString() : '';
          $rootScope.pageTitle = element.reference + modifierStr + ' ' + element.header + ' - ' + Styleguide.config.data.title;
        }

        // Select correct modifier element if one is defined
        if (modifier) {
          element = element.modifiers[modifier - 1];
        }

        // Set the actual page content
        $scope.previousSection = previousSection();
        $scope.nextSection = nextSection();
        $scope.section = element;
        $scope.variables = Variables.variables;
        $scope.markup = $filter('setVariables')(element.wrappedMarkup, $scope.variables);
      }
    }
  });
