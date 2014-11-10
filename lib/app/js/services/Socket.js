'use strict';

angular.module('sgApp')
  .service('Socket', ['$rootScope', function($rootScope) {

    var socket,
      connected = false,
      service = {
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
        },

        isConnected: function() {
          return connected;
        }
    };

    if (typeof io !== 'undefined') {
      socket = io.connect('/');

      service.on('connect', function() {
        connected = true;
        $rootScope.$broadcast('socket connected');
      });

      service.on('disconnect', function() {
        connected = false;
        $rootScope.$broadcast('socket disconnected');
      });

      service.on('error', function(err) {
        $rootScope.$broadcast('socket error', err);
      })
    }

    return service;

  }]);
