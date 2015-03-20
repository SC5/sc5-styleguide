'use strict';

angular.module('sgApp')
  .controller('AppCtrl', function($scope, ngProgress) {
    // ngProgress do not respect styles assigned via CSS if we do not pass empty parameters
    // See: https://github.com/VictorBjelkholm/ngProgress/issues/33
    ngProgress.height('');
    ngProgress.color('');

    // Scroll top when page is changed
    $scope.$on('$viewContentLoaded', function() {
      window.scrollTo(0, 0);
    });

    $scope.$on('progress start', function() {
      ngProgress.start();
    });

    $scope.$on('progress end', function() {
      ngProgress.complete();
    });

    // Reload styles when server notifies about the changes
    // Add cache buster to every stylesheet on the page forcing them to reload
    $scope.$on('styles changed', function() {
      var links = Array.prototype.slice.call(document.getElementsByTagName('link'));
      links.forEach(function(link) {
        if (typeof link === 'object' && link.getAttribute('type') === 'text/css' && link.getAttribute('data-noreload') === null) {
          link.href = link.href.split('?')[0] + '?id=' + new Date().getTime();
        }
      });
    });

    $scope.$on('socket connected', function() {
      console.log('Socket connection established');
    });

    $scope.$on('socket disconnected', function() {
      console.error('Socket connection dropped');
      ngProgress.reset();
    });

    $scope.$on('socket error', function(err) {
      console.error('Socket error:', err);
    });

  });
