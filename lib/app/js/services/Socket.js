angular.module('sgApp')
  .service('Socket', function($rootScope, $window) {

    'use strict';

    var socket,
      connected = false,
      deferredEventListeners = [],
      service = {
        isAvailable: function() {
          return (typeof $window.io !== 'undefined');
        },
        on: function(eventName, listener) {
          var fn = function() {
            var args = arguments;
            $rootScope.$apply(function() {
              listener.apply(undefined, args);
            });
          };

          deferredEventListeners.push({
            event: eventName,
            listener: fn
          });

          if (this.isConnected()) {
            socket.on(eventName, fn);
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
          return socket !== undefined && connected === true;
        },
        connect: connect
    };

    function connect() {
      if (service.isAvailable()) {
        if (connected) {
          socket.disconnect();
        }

        socket = $window.io.connect();

        deferredEventListeners.forEach(function(deferred) {
          socket.on(deferred.event, deferred.listener);
        });
      }
    }

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
    });

    return service;

  });
