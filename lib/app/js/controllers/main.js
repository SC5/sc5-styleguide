'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function($scope, $location, $state, Styleguide, Variables, localStorageService, Socket) {

    // Bind scope variables to service updates
    $scope.sections = Styleguide.sections;
    $scope.config = Styleguide.config;
    $scope.status = Styleguide.status;
    $scope.variables = Variables.variables;
    $scope.toggleMenu = true;
    $scope.markupSection = {isVisible: ''};

    $scope.$watch('config.data', function() {
      if ($scope.config.data) {
        $scope.markupSection = {isVisible: $scope.config.data.showMarkupSection};
        localStorageService.bind($scope, 'markupSection', {isVisible: $scope.config.data.showMarkupSection});
      }
    });

    $scope.designerTool = {isVisible: false};
    localStorageService.bind($scope, 'designerTool', {isVisible: false});

    $scope.toggleSideNav = function(toggleMenu) {
      $scope.toggleMenu = !toggleMenu;
      return $scope.toggleMenu;
    };

    $scope.isMainSectionNavigable = function() {
      return $scope.config.data.hideSubsectionsOnMainSection ? '-' : 'app.index.section({section: section.reference})';
    };

    $scope.isSideNav = function() {
      if ($scope.config.data && $scope.config.data.sideNav) {
        return 'sideNav';
      } else if ($scope.config.data && !$scope.config.data.sideNav) {
        return 'topNav';
      }
    };

    // Bind variable to scope to wait for data to be resolved
    $scope.socketService = Socket;

    // Check if section is a main section
    $scope.filterMainSections = function() {
      return function(section) {
        return !!section.reference && /^[A-Za-z0-9_-]+$/.test(section.reference);
      };
    };

    $scope.filterSubsections = function(parentSection) {
      return function(section) {
        return new RegExp('^' + parentSection.reference + '\.[A-Za-z0-9_-]+$').test(section.reference);
      };
    };

    $scope.hasSubsections = function(parentSection) {
      var result = false;
      angular.forEach($scope.sections.data, function(section) {
        if (parentSection.reference === section.parentReference) {
          result = true;
          return;
        }
      });

      return result;
    };

    // Toggle all markup boxes visible/hidden state
    $scope.toggleMarkup = function() {
      $scope.markupSection.isVisible = !$scope.markupSection.isVisible;
      for (var i = 0; i < $scope.sections.data.length; i++) {
        $scope.sections.data[i].showMarkup = $scope.markupSection.isVisible;
      }
    };

    // Change route to /all when searching
    $scope.$watch('search.$', function(newVal) {
      if (typeof newVal === 'string') {
        $state.go('app.index.search', {section: 'all'});
      }
    });

    // Clear search
    $scope.clearSearch = function() {
      if ($scope.search) {
        $scope.search = {};
      }
    };

  });
