angular.module('sgApp')
  .controller('SectionsCtrl', function ($scope, $stateParams, $location, $state,
    $rootScope, Styleguide, Variables) {

    var socket, syncVariables;

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

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data.sections;
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });

    syncVariables = function(data) {
      Variables.setValues(data);
    };

    // Socket.io hookups
    if (io) {
      socket = io('/');
      socket.on('connect', syncVariables);
    }

  });

