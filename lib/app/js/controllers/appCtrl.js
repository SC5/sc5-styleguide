'use strict';

angular.module('sgApp')
  .controller('AppCtrl', [
    '$scope', 'ngProgress',
    function($scope, ngProgress) {

    // ngProgress do not respect styles assigned via CSS if we do not pass empty parameters
    // See: https://github.com/VictorBjelkholm/ngProgress/issues/33
    ngProgress.height('');
    ngProgress.color('');

    $scope.$on('$viewContentLoaded', function() {
      window.scrollTo(0, 0);
    });

    $scope.$on('progress start', function() {
      ngProgress.start();
    });

    $scope.$on('progress end', function() {
      ngProgress.complete();
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
  }]);
