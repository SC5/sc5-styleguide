(function() {

  'use strict';

  var Variables = function(localStorageService) {

    var socket,
      values = {};

    this.getValue = function(valueName) {
      if (values.hasOwnProperty(valueName)) {
        return values[valueName];
      }
      else {
        throw 'Invalid value!';
      }
    };

    this.getValues = function() {
      return values;
    };

    this.setValue = function(valueName, value) {
      values[valueName] = value;
      return this;
    };

    this.setValues = function(newValues, overrideAll) {
      if (typeof newValues !== 'object' || newValues === null) {
        throw 'Invalid values!';
      }

      if (overrideAll) {
        values = newValues;
      } else {
        for (var valueName in newValues) {
          if (newValues.hasOwnProperty(valueName)) {
            values[valueName] = newValues[valueName];
          }
        }
      }

      return this;
    };

    this.getSocket = function() {
      return socket;
    };

    this.setSocket = function(newSocket) {
      var _this = this;

      socket = newSocket;

      if (typeof socket !== 'undefined' && socket !== null) {
        socket.on('variables from server', function(data) {
          _this.setValues(data);
          console.log('EVENT: variables from server');
          console.log(data);
        });

        socket.on('variables saved to server', function(data) {
          console.log('EVENT: variables saved to server');

          // Clear variables from localStorage after saving to server
          var variables = localStorageService.get('variables');
          if (variables) {
            localStorageService.remove('variables');
          }
          console.log(data);
        });
      }

      return this;
    };

    this.sync = function(method, syncWithServer) {
      var validMethods = ['load', 'save'];

      // Parameter validation
      if (validMethods.indexOf(method) === -1) {
        throw 'No valid method provided. Available methods: ' + validMethods.join(', ');
      }
      if (syncWithServer && !this.getSocket()) {
        throw 'Socket not available.';
      }

      // Load variables from server or localStorage
      if (method === 'load') {
        if (!syncWithServer) {
          this.setValues(JSON.parse(localStorageService.get('variables')));
        } else if (syncWithServer) {
          socket.emit('request variables from server');
        }
      }

      // Save variables to server or localStorage
      if (method === 'save') {
        localStorageService.set('variables', JSON.stringify(this.getValues()));
        if (syncWithServer) {
          socket.emit('variables to server', this.getValues());
          console.log('EVENT: variables to server');
          console.log(this.getValues());
        }
      }
    };

    this.saveVariables = function() {
      var saveToServer;

      if (this.getSocket()) {
        saveToServer = confirm('Save to server?');
      } else {
        saveToServer = false;
      }

      this.sync('save', saveToServer);
    };

    // Start constructor
    if (typeof io !== 'undefined') {
      this.setSocket(io('/'));
      socket.emit('request variables from server');
      console.log('EVENT: request variables from server');
    } else {
      this.setSocket(null);
    }
    // End constructor

  };

  angular.module('sgApp').service('Variables', ['localStorageService', Variables]);

}());
