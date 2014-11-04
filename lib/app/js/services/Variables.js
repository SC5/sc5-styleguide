(function() {

  'use strict';

  var Variables = function(Styleguide, $q, $rootScope) {
    var serverData = {};

    this.variables = {};
    this.socket = {};

    this.setValue = function(valueName, value) {
      var obj = {};
      obj[valueName] = value;
      this.setValues(obj);
      return this;
    };

    this.setValues = function(newValues) {
      var _this = this;
      if (typeof newValues !== 'object' || newValues === null) {
        throw 'Invalid values!';
      }
      var localCopy = angular.copy(this.variables);
      // Add missing keys to variables
      angular.forEach(serverData, function(value, key) {
        if (!localCopy[key]) {
          _this.variables[key] = serverData[key];
        }
      });
      // Update values and remove keys that does not exist on server data
      angular.forEach(localCopy, function(value, key) {
        if (!serverData[key]) {
          delete _this.variables[key];
        } else if (newValues[key]) {
          _this.variables[key] = newValues[key];
        }
      });
      return this;
    };

    this.resetLocal = function() {
      var _this = this;
      // We need to remove each key individually to keep the object reference the same
      angular.forEach(this.variables, function(value, key) {
        delete _this.variables[key];
      });
      // Call setValues so that the server data is used
      this.setValues({});
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
        this.socket.emit('variables to server', this.variables);
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

      $rootScope.$watch(function() {
        return Styleguide.config.data;
      }, function(newValue) {
        if (newValue) {
          serverData = newValue.settings;
          _this.setValues({});
        }
      });
    };

    // Run constructor
    this.init();
  };

  angular.module('sgApp').service('Variables', ['Styleguide', '$q', '$rootScope', Variables]);
}());
