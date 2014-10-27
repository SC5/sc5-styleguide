'use strict';

angular.module('sgApp')
  .controller('AppCtrl', function($scope) {

    $scope.$on('$viewContentLoaded', function() {
      window.scrollTo(0, 0);
    });

  }
);
