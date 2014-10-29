'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function($scope, $location, $state, $rootScope,
    Styleguide, Variables, localStorageService) {

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

    $scope.$on('styles changed', function() {
      var links = document.getElementsByTagName('link');
      for (var l in links) {
        var link = links[l];
        if (typeof link === 'object' && link.getAttribute('type') === 'text/css') {
          link.href = link.href.split('?')[0] + '?id=' + new Date().getTime();
        }
      }
    });

    // Clear search
    $scope.clearSearch = function() {
      if ($scope.search) {
        $scope.search = {};
      }
    }
  });
