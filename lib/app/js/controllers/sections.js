angular.module('sgApp')
  .controller('SectionsCtrl', [
    '$scope', '$stateParams', '$location', '$state', '$rootScope', 'Styleguide',
    function($scope, $stateParams, $location, $state, $rootScope, Styleguide) {

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

    $rootScope.$watch(function() {
      return Styleguide.sections.data;
    }, function(newVal, oldVal) {
      parseStateHeading($scope.currentSection);
    });

    $rootScope.$watch(function() {
      return Styleguide.config.data;
    }, function(newVal, oldVal) {
      parseStateHeading($scope.currentSection);
    });

    function parseStateHeading(section) {
      if (section === 'all' && typeof Styleguide.config.data !== 'undefined') {
        $rootScope.pageTitle = 'All sections - ' + Styleguide.config.data.title;
      } else if (typeof Styleguide.sections.data !== 'undefined') {
        for (var i = 0; i < Styleguide.sections.data.length; i++) {
          if (Styleguide.sections.data[i].reference == section) {
            $rootScope.pageTitle = Styleguide.sections.data[i].header + ' - ' + Styleguide.config.data.title
          }
        };
      }
    }

    // Check section level (main/sub/sub-sub/sub-sub-sub)
    $scope.getLevel = function(section) {
      if (/([0-9]\.[0-9]\.[0-9]\.)/.test(section.reference)) {
        return 'sub-sub-sub';
      }
      if (/([0-9]\.[0-9]\.)/.test(section.reference)) {
        return 'sub-sub';
      }
      if (/([0-9]\.)/.test(section.reference)) {
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

    $scope.getCommonClass = function() {
      return Styleguide.config.data.commonClass;
    }
  }]);
