(function() {

  'use strict';

  var Variables = function(Styleguide, $q, $rootScope) {

    var socket,
      values = {},
      serverData = {},
      localData = {},
      loadPromise = $q.defer();

    this.variables = {};

    this.setValue = function(valueName, value) {
      var obj = {};
      obj[valueName] = value;
      this.setValues(obj);
      return this;
    };

    this.setValues = function(newValues) {
      if (typeof newValues !== 'object' || newValues === null) {
        throw 'Invalid values!';
      }

      var copy = angular.copy(this.variables);
      angular.extend(copy, newValues);
      angular.extend(this.variables, serverData, copy);

      return this;
    };

    this.getSocket = function() {
      return loadPromise.promise.then(function() {
        return socket;
      });
    };

    this.setSocket = function(newSocket) {
      var _this = this;
      socket = newSocket;
      if (socket) {
        socket.on('styleguide progress start', function() {
          $rootScope.$broadcast('progress start');
        });
        socket.on('styleguide progress end', function() {
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
        socket.emit('request variables from server');
      }

      // Save variables to server or localStorage
      if (method === 'save') {
        socket.emit('variables to server', this.variables);
      }
    };

    this.saveVariables = function() {
      var _this = this;
      this.getSocket().then(function(socket) {
        if (socket) {
          _this.sync('save');
        } else {
          throw 'Socket not available.';
        }
      });
    };

    // Start constructor
    this.init = function() {
      var _this = this;
      return Styleguide.get().then(function(response) {
        // Get initial values from styleguide.json
        serverData = response.data.config.settings;
        _this.setValues({});

        // If io is defined, override values from server
        if (typeof io !== 'undefined') {
          _this.setSocket(io('/'));
        } else {
          _this.setSocket(null);
        }

        // Resolve data to be called out of init scope
        loadPromise.resolve();

        return loadPromise.promise;
      },
      function(response) {
        console.log('Error response: ', response);
      });
    };

    // Run constructor
    this.init();
  };

  angular.module('sgApp').service('Variables', ['Styleguide', '$q', '$rootScope', Variables]);
}());
