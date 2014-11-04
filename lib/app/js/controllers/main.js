'use strict';

angular.module('sgApp')
  .controller('MainCtrl', [
    '$scope', '$location', '$state', 'Styleguide', 'Variables', 'localStorageService', 'ngProgress',
    function($scope, $location, $state, Styleguide, Variables, localStorageService, ngProgress) {

    var socket;

    $scope.isNavCollapsed = false;
    $scope.markup = {isVisible: true};
    $scope.designerTool = {isVisible: false};
    localStorageService.bind($scope, 'markup', {isVisible: true});
    localStorageService.bind($scope, 'designerTool', {isVisible: false});

    // Bind scope variables to service updates
    $scope.sections = Styleguide.sections;
    $scope.config = Styleguide.config;
    $scope.variables = Variables.variables;

    // Bind variable to scope to wait for data to be resolved
    $scope.socket = Variables.socket;

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    // Toggle all markup boxes visible/hidden state
    $scope.toggleMarkup = function() {
      $scope.markup.isVisible = !$scope.markup.isVisible;
      for (var i = 0; i < $scope.sections.length; i++) {
        $scope.sections[i].showMarkup = $scope.markup.isVisible;
      }
    }

    // Change route to /all when searching
    $scope.$watch('search.$', function(newVal, oldVal) {
      if (newVal && newVal.length > 0) {
        $location.url('all');
      };
    });

    // Clear search
    $scope.clearSearch = function() {
      if ($scope.search) {
        $scope.search = {};
      }
    }
  }]);
