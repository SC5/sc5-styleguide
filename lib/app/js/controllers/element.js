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
      var sections, result, mod;
      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(item) {
        return reference === item.reference;
      });

      if (result.length > 0) {
        if (modifier <= 1) {
          return false;
        }
        mod = result[0].reference + '-' + (parseInt(modifier) - 1);
      }
      return mod;
    }

    function nextSection() {
      var sections, result, mod;
      if (!Styleguide.sections.data) {
        return;
      }
      sections = Styleguide.sections.data;

      // Find correct element definition from styleguide data
      result = sections.filter(function(item) {
        return reference === item.reference;
      });

      if (result.length > 0) {
        if (modifier >= result[0].modifiers.length) {
          return false;
        }
        mod = result[0].reference + '-' + (parseInt(modifier) + 1);
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
