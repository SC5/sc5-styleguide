angular.module('sgApp')
  .controller('SectionsCtrl', function ($scope, $stateParams, $location, $state,
    $rootScope, Styleguide, Variables) {

    var socket, loadVariables;

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

    // Check section level (main/sub/sub-sub/sub-sub-sub)
    $scope.getLevel = function(section) {
      if ( /([0-9]\.[0-9]\.[0-9]\.)/.test(section.reference) ) {
        return 'sub-sub-sub';
      }
      if ( /([0-9]\.[0-9]\.)/.test(section.reference) ) {
        return 'sub-sub';
      }
      if ( /([0-9]\.)/.test(section.reference) ) {
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

    loadVariables = function(variables) {
      return function(data) {
        variables.setValues(JSON.parse(data));
      };
    };

    // Socket.io hookups
    if (io) {
      socket = io('/');
      socket.on('initial-values', loadVariables(Variables));
    }

  });

