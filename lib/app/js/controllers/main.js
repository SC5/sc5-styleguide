'use strict';

angular.module('sgApp')
  .controller('MainCtrl', [
    '$scope', '$location', '$state', 'Styleguide', 'Variables', 'localStorageService', 'Socket',
    function($scope, $location, $state, Styleguide, Variables, localStorageService, Socket) {

    $scope.isNavCollapsed = false;
    $scope.markupSection = {isVisible: true};
    $scope.designerTool = {isVisible: false};

    localStorageService.bind($scope, 'markupSection', {isVisible: true});
    localStorageService.bind($scope, 'designerTool', {isVisible: false});

    // Bind scope variables to service updates
    $scope.sections = Styleguide.sections;
    $scope.config = Styleguide.config;
    $scope.status = Styleguide.status;
    $scope.variables = Variables.variables;

    // Bind variable to scope to wait for data to be resolved
    $scope.socketService = Socket;
    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    };

    // Toggle all markup boxes visible/hidden state
    $scope.toggleMarkup = function() {
      $scope.markupSection.isVisible = !$scope.markupSection.isVisible;
      for (var i = 0; i < $scope.sections.data.length; i++) {
        $scope.sections.data[i].showMarkup = $scope.markupSection.isVisible;
      }
    };

    // Change route to /all when searching
    $scope.$watch('search.$', function(newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        $location.url('all');
      }
    });

    // Clear search
    $scope.clearSearch = function() {
      if ($scope.search) {
        $scope.search = {};
      }
    }
  }]);
