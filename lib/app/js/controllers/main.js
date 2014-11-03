'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function($scope, $location, $state,
    Styleguide, Variables, localStorageService, ngProgress) {

    var socket;

    $scope.isNavCollapsed = false;

    // Because localStorage only saves String type values, try to convert to boolean
    $scope.checkIfMarkupVisible = function() {
      var showAllMarkup = localStorageService.get('showAllMarkup');
      if (showAllMarkup == null) {
        $scope.showAllMarkup = true;
      } else {
        if (showAllMarkup == 'false' || showAllMarkup === false) {
          $scope.showAllMarkup = false;
        } else {
          $scope.showAllMarkup = true;
        }
      }
    }

    $scope.checkIfMarkupVisible();

    // Bind scope variables to service updates
    $scope.sections = Styleguide.sections;
    $scope.config = Styleguide.config;
    $scope.variables = Variables.variables;

    // Bind variable to scope to wait for data to be resolved
    $scope.socket = {};

    Variables.getSocket().then(function(response) {
      $scope.socket = response;
    });

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    // Toggle all markup boxes visible/hidden state
    $scope.toggleMarkup = function() {
      $scope.showAllMarkup = !$scope.showAllMarkup;
      for (var i = 0; i < $scope.sections.length; i++) {
        $scope.sections[i].showMarkup = $scope.showAllMarkup;
      }
      localStorageService.add('showAllMarkup', $scope.showAllMarkup);
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
