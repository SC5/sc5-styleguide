'use strict';

angular.module('sgApp')
  .factory('Socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();
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
