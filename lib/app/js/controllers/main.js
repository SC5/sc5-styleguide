'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function($scope, $location, $state, $rootScope,
    Styleguide, Variables, localStorageService, ngProgress) {

    var socket;

    $scope.isNavCollapsed = false;
    $scope.markup = {isVisible: true};
    $scope.designerTool = {isVisible: false};
    localStorageService.bind($scope, 'markup', {isVisible: true});
    localStorageService.bind($scope, 'designerTool', {isVisible: false});

    // Fetch styleguide data
    Styleguide.get()
      .success(function(data) {
        $scope.sections = data.sections;
        $rootScope.config = data.config;
      })
      .error(function(data) {
        console.log('Error loading data.json');
      });

    // Bind variable to scope to wait for data to be resolved
    $scope.variables = {};
    $scope.socket = {};

    Variables.getSocket().then(function(response) {
      $scope.socket = response;
    });

    $scope.$watch(function() {
      return Variables.variables;
    }, function(newVal) {
      if (newVal) {
        $scope.variables = newVal;
      }
    });

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
  });
