angular.module('sgApp')
  .service('Socket', ['$rootScope', function($rootScope) {

    'use strict';

    var socket,
      connected = false,
      service = {
        on: function(eventName, listener) {
          if (socket) {
            socket.on(eventName, function() {
              var args = arguments;
              $rootScope.$apply(function() {
                listener.apply(undefined, args);
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
                  callback.apply(undefined, args);
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
