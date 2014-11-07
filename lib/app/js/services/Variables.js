(function() {

  'use strict';

  var Variables = function(Styleguide, $q, $rootScope, Socket) {

    // Server data contains data initially load from the server
    var _this = this, serverData = {};
    // variables contain the actual data passed outside the service
    // variables could not contain any keys that does not exist in the serverData object
    this.variables = {};

    $rootScope.$watch(function() {
      return _this.variables;
    }, function() {
      _this.refreshDirtyStates();
    }, true);

    this.refreshDirtyStates = function() {
      // Mark variables that differ from the server version as dirty
      angular.forEach(_this.variables, function(value, key) {
        if (serverData[key] && _this.variables[key] && serverData[key].value !== _this.variables[key].value && !_this.variables[key].dirty) {
          _this.variables[key].dirty = true;
        } else if (serverData[key] && _this.variables[key] && serverData[key].value === _this.variables[key].value && _this.variables[key].dirty) {
          delete _this.variables[key].dirty;
        }
      });
    }

    this.refreshValues = function() {
      var _this = this,
        localCopy = angular.copy(this.variables);
      // Server data could contain new or deleted keys that we want to update
      // Add missing keys from server data to variables object
      // Update values that are not marked as dirty (does not have local changes)
      angular.forEach(serverData, function(value, key) {
        if (!localCopy[key] || (localCopy[key] && !localCopy[key].dirty)) {
          _this.variables[key] = angular.copy(serverData[key]);
        }
      });
      // Remove keys that does not exist on server data
      // Update local indexes
      angular.forEach(localCopy, function(value, key) {
        if (!serverData[key]) {
          delete _this.variables[key];
        } else {
          // Update changed index always
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
      this.socket = newSocket;
      this.socket.on('styleguide progress start', function() {
        $rootScope.$broadcast('progress start');
      });
      this.socket.on('styleguide progress end', function() {
        $rootScope.$broadcast('progress end');
        $rootScope.$broadcast('styles changed');
      });
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
    this.init = function(socket) {
      var _this = this;
      this.setSocket(socket);

      // Update new server data when it is available
      $rootScope.$watch(function() {
        return Styleguide.config.data;
      }, function(newValue) {
        if (newValue) {
          serverData = newValue.settings;
          _this.refreshValues();
          _this.refreshDirtyStates();
        }
      });
    };

    // Run constructor
    this.init(Socket);
  };

  angular.module('sgApp').service('Variables', ['Styleguide', '$q', '$rootScope', 'Socket', Variables]);
}());
