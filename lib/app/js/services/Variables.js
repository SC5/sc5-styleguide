(function() {

  'use strict';

  var Variables = function(Styleguide, $q, $rootScope) {
    // Server data contains data initially load from the server
    var serverData = {};
    // variables contain the actual data passed outside the service
    // variables could not contain any keys that does not exist in the serverData object
    this.variables = {};
    this.socket = {};

    this.refreshValues = function() {
      var _this = this,
        localCopy = angular.copy(this.variables);
      // Server data could contain new or deleted keys that we want to update
      // Add missing keys from server data to variables object
      angular.forEach(serverData, function(value, key) {
        if (!localCopy[key]) {
          _this.variables[key] = angular.copy(serverData[key]);
        }
      });
      // Remove keys that does not exist on server data
      // Update local indexes
      angular.forEach(localCopy, function(value, key) {
        if (!serverData[key]) {
          delete _this.variables[key];
        } else {
          _this.variables[key].index = serverData[key].index;
        }
      });
      return this;
    };

    this.resetLocal = function() {
      var _this = this;
      // Reset every key to corresponding server value
      angular.forEach(this.variables, function(value, key) {
        _this.variables[key].value = serverData[key].value;
      });
    };

    this.setSocket = function(newSocket) {
      var _this = this;
      this.socket = newSocket;
      if (this.socket) {
        this.socket.on('styleguide progress start', function() {
          $rootScope.$broadcast('progress start');
        });
        this.socket.on('styleguide progress end', function() {
          $rootScope.$broadcast('progress end');
          $rootScope.$broadcast('styles changed');
        });
      }
      return this;
    };

    this.sync = function(method) {
      var validMethods = ['load', 'save'];

      // Parameter validation
      if (validMethods.indexOf(method) === -1) {
        throw 'No valid method provided. Available methods: ' + validMethods.join(', ');
      }

      // Load variables from server or localStorage
      if (method === 'load') {
        this.socket.emit('request variables from server');
      }

      // Save variables to server or localStorage
      if (method === 'save') {
        var oldVars = this.variables,
            newVars = {};
        Object.keys(oldVars).forEach(function(key) {
          newVars[key] = oldVars[key].value;
        });
        this.socket.emit('variables to server', newVars);
      }
    };

    this.saveVariables = function() {
      var _this = this;
      if (this.socket) {
        _this.sync('save');
      } else {
        throw 'Socket not available.';
      }
    };

    // Start constructor
    this.init = function() {
      var _this = this;
      // If io is defined, override values from server
      if (typeof io !== 'undefined') {
        _this.setSocket(io('/'));
      } else {
        _this.setSocket(null);
      }

      // Update new server data when it is available
      $rootScope.$watch(function() {
        return Styleguide.config.data;
      }, function(newValue) {
        if (newValue) {
          serverData = newValue.settings;
          _this.refreshValues();
        }
      });
    };

    // Run constructor
    this.init();
  };

  angular.module('sgApp').service('Variables', ['Styleguide', '$q', '$rootScope', Variables]);
}());
