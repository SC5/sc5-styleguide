(function() {

  'use strict';

  var Variables = function(Styleguide, $q, $rootScope, Socket) {

    // Server data contains data initially load from the server
    var _this = this, serverData = [];
    // variables contain the actual data passed outside the service
    // variables could not contain any keys that does not exist in the serverData object
    this.variables = [];

    $rootScope.$watch(function() {
      return _this.variables;
    }, function() {
      _this.refreshDirtyStates();
    }, true);

    this.getLocalVarByName = function(name) {
      for (var i = this.variables.length - 1; i >= 0; i--) {
        if (this.variables[i].name === name) {
          return this.variables[i];
        }
      }
    };

    this.getLocalIndexByName = function(name) {
      for (var i = this.variables.length - 1; i >= 0; i--) {
        if (this.variables[i].name === name) {
          return i;
        }
      }
    };

    this.getServerVarByName = function(name) {
      for (var i = serverData.length - 1; i >= 0; i--) {
        if (serverData[i].name === name) {
          return serverData[i];
        }
      }
    };

    this.refreshDirtyStates = function() {
      var _this = this;
      // Mark variables that differ from the server version as dirty
      angular.forEach(_this.variables, function(variable) {
        var serverVar = _this.getServerVarByName(variable.name);
        if (serverVar && serverVar.value !== variable.value && !variable.dirty) {
          variable.dirty = true;
        } else if (serverVar && serverVar.value === variable.value && variable.dirty) {
          delete variable.dirty;
        }
      });
    };

    this.refreshValues = function() {
      if (serverData.length === 0) {
        this.variables = [];
      } else {
        for (var i = 0; i < serverData.length; i++) {
          var oldIndex;
          if (this.variables[i] && this.variables[i].name !== serverData[i].name) {
            if (!this.getServerVarByName(this.variables[i].name)) {
              // This variable does not exists anymore on the server. Remove it
              this.variables.splice(i, 1);
            } else if (this.getLocalVarByName(serverData[i].name) && !this.getLocalVarByName(serverData[i].name).dirty) {
              // The variable already exists but in another position
              // It is not changed so we can just remove it
              oldIndex = this.getLocalIndexByName(serverData[i].name);
              this.variables.splice(oldIndex, 1);
              this.variables.splice(i, 0, {name: serverData[i].name, value: serverData[i].value});
            } else if (this.getLocalVarByName(serverData[i].name)) {
              // The variable already exists but in another position
              // It is changed so we need to keep the old values
              oldIndex = this.getLocalIndexByName(serverData[i].name);
              var oldValue = this.variables[oldIndex].value;
              this.variables.splice(oldIndex, 1);
              this.variables.splice(i, 0, {name: serverData[i].name, value: oldValue});
            } else {
              // The variable does not exists anywhere else. Just add it
              this.variables.splice(i, 0, {name: serverData[i].name, value: serverData[i].value});
            }
          } else if (this.variables[i] && this.variables[i].name === serverData[i].name) {
            // Variable exists already locally
            // Update value if variable does not have any local changes
            if (!this.variables[i].dirty) {
              this.variables[i].value = serverData[i].value;
            }
          } else if (!this.variables[i]) {
            // Add new local variable
            this.variables.push({name: serverData[i].name, value: serverData[i].value});
          }
        }
      }
    };

    this.resetLocal = function() {
      var _this = this;
      // Reset every key to corresponding server value
      angular.forEach(this.variables, function(variable) {
        var serverVar = _this.getServerVarByName(variable.name);
        if (serverVar) {
          variable.value = serverVar.value;
        }
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

      // Save variables to server
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
    this.init = function(socket) {
      var _this = this;
      this.setSocket(socket);

      // Update new server data when it is available
      $rootScope.$watch(function() {
        return Styleguide.config.data;
      }, function(newValue) {
        if (newValue) {
          if (newValue.settings) {
            serverData = newValue.settings;
          } else {
            serverData = [];
          }
          _this.refreshValues();
          _this.refreshDirtyStates();
        }
      });
    };

    // Run constructor
    this.init(Socket);
  };

  angular.module('sgApp').service('Variables', Variables);
}());
