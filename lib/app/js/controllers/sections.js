angular.module('sgApp')
  .controller('SectionsCtrl', function($scope, $stateParams, $location, $state, $rootScope, Styleguide) {

    if ($stateParams.section) {
      $scope.currentSection = $stateParams.section;
      $rootScope.currentSection = $scope.currentSection;
    } else {
      $location.url('overview');
    }

    $rootScope.$watch(function() {
      return Styleguide.sections.data;
    }, function() {
      setPageTitle($scope.currentSection);
    });

    $rootScope.$watch(function() {
      return Styleguide.config.data;
    }, function() {
      setPageTitle($scope.currentSection);
    });

    function setPageTitle(section) {
      if (!Styleguide.config.data || !Styleguide.sections.data) {
        return;
      }
      if (section === 'all') {
        $rootScope.pageTitle = 'All sections - ' + Styleguide.config.data.title;
      } else {
        var result = Styleguide.sections.data.filter(function(item) {
          return item.reference === section;
        });
        if (result.length > 0) {
          $rootScope.pageTitle = result[0].reference + ' ' + result[0].header + ' - ' + Styleguide.config.data.title;
        }
      }
    }

    $scope.isEmptyMainSection = function(section) {
      return section.reference.indexOf('.') === -1 && !section.wrappedMarkup && (!section.modifiers || section.modifiers.length === 0);
    };

    $scope.isActive = function(section) {
      return section.reference === $rootScope.currentReference.section.reference ? 'active' : '';
    };

    $scope.filterSections = function(section) {
      if ($scope.currentSection === 'all') {
        return true;
      }
      return new RegExp('^' + $scope.currentSection + '(\\D|$)').test(section.reference);
    };
  });
