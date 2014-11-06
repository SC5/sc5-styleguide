'use strict';

angular.module('sgApp')
  .factory('Socket', ['$rootScope', function($rootScope) {

    var socket;

    if (typeof io !== 'undefined') {
      socket = io.connect('/');

      socket.on('connect', function() {
        $rootScope.$broadcast('socket connected');
      });

      socket.on('disconnect', function() {
        $rootScope.$broadcast('socket disconnected');
      });

      socket.on('error', function(err) {
        $rootScope.$broadcast('socket error', err);
      })
    }

    return {
      on: function(eventName, callback) {
        if (socket) {
          socket.on(eventName, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              callback.apply(socket, args);
            });
          });
        }
      },

      emit: function(eventName, data, callback) {
        if (socket) {
          socket.emit(eventName, data, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        }
      }
    };

  }]);
