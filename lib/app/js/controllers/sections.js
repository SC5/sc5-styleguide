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

    $scope.filterSection = function(section) {
      if ($scope.currentSection === 'all') return true;
      var re = new RegExp('(^' + $scope.currentSection + ')');
      return re.test(section.reference);
    }

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data;
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });
  });