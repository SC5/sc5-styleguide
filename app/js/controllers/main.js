'use strict';

angular.module('sgApp')
  .controller('MainCtrl', function ($scope, Socket) {
    // Emit ready event.
    Socket.emit('ready');

    // Listen for the talk event.
    Socket.on('update', function(data) {
      $scope.sections = data;
    });
  });