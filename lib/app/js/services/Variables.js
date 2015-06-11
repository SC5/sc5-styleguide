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
      if (!_this.refreshDirtyStates() && Styleguide.status.hasError && Styleguide.status.errType === 'validation') {
        // Assume that if there isn't local changes there isn't any errors since data received from the server is always valid
        // Clear only validation errors
        Styleguide.status.hasError = false;
      }
    }, true);

    this.variableMatches = function(var1, var2) {
      return var1.name === var2.name && var1.file === var2.file;
    };

    this.getLocalVar = function(variable) {
      for (var i = this.variables.length - 1; i >= 0; i--) {
        if (this.variableMatches(this.variables[i], variable)) {
          return this.variables[i];
        }
      }
    };

    this.getLocalIndex = function(variable) {
      for (var i = this.variables.length - 1; i >= 0; i--) {
        if (this.variableMatches(this.variables[i], variable)) {
          return i;
        }
      }
    };

    this.getServerVar = function(variable) {
      for (var i = serverData.length - 1; i >= 0; i--) {
        if (this.variableMatches(serverData[i], variable)) {
          return serverData[i];
        }
      }
    };

    this.refreshDirtyStates = function() {
      var _this = this,
        hasDirtyVars = false;
      // Mark variables that differ from the server version as dirty
      angular.forEach(_this.variables, function(variable) {
        var serverVar = _this.getServerVar(variable);
        if (serverVar && serverVar.value !== variable.value) {
          variable.dirty = true;
          hasDirtyVars = true;
        } else if (serverVar && serverVar.value === variable.value && variable.dirty) {
          delete variable.dirty;
        }
      });
      return hasDirtyVars;
    };

    this.refreshValues = function() {
      var oldIndex, oldValue, newObject, i;
      if (serverData.length === 0) {
        this.variables = [];
      } else {
        for (i = 0; i < serverData.length; i++) {
          if (this.variables[i] && !this.variableMatches(this.variables[i], serverData[i])) {
            if (!this.getServerVar(this.variables[i])) {
              // This variable does not exists anymore on the server. Remove it
              this.variables.splice(i, 1);
            } else if (this.getLocalVar(serverData[i]) && !this.getLocalVar(serverData[i]).dirty) {
              // The variable already exists but in another position
              // It is not changed so we can just remove it
              oldIndex = this.getLocalIndex(serverData[i]);
              this.variables.splice(oldIndex, 1);
              this.variables.splice(i, 0, angular.copy(serverData[i]));
            } else if (this.getLocalVar(serverData[i])) {
              // The variable already exists but in another position
              // It is changed so we need to keep the old values
              oldIndex = this.getLocalIndex(serverData[i]);
              oldValue = this.variables[oldIndex].value;
              this.variables.splice(oldIndex, 1);
              newObject = angular.copy(serverData[i]);
              newObject.value = oldValue;
              this.variables.splice(i, 0, newObject);
            } else {
              // The variable does not exists anywhere else. Just add it
              this.variables.splice(i, 0, angular.copy(serverData[i]));
            }
          } else if (this.variables[i] && this.variableMatches(this.variables[i], serverData[i])) {
            // The linenumber might have changed
            this.variables[i].line = serverData[i].line;

            // Variable exists already locally
            // Update value if variable does not have any local changes
            if (!this.variables[i].dirty) {
              this.variables[i].value = serverData[i].value;
            }
          } else if (!this.variables[i]) {
            // Add new local variable
            this.variables.push(angular.copy(serverData[i]));
          }
        }
      }
    };

    this.resetLocal = function() {
      var _this = this;
      // Reset every key to corresponding server value
      angular.forEach(this.variables, function(variable) {
        var serverVar = _this.getServerVar(variable);
        if (serverVar) {
          variable.value = serverVar.value;
        }
      });
    };

    this.setSocket = function(newSocket) {
      this.socket = newSocket;
      if (this.socket) {
        this.addSocketListeners();
      }
      return this;
    };

    this.addSocketListeners = function() {
      this.socket.on('styleguide progress start', function() {
        $rootScope.$broadcast('progress start');
      });
      this.socket.on('styleguide progress end', function() {
        $rootScope.$broadcast('progress end');
      });
      this.socket.on('styleguide styles changed', function() {
        $rootScope.$broadcast('styles changed');
      });
    };

    this.saveVariables = function() {
      if (this.socket) {
        this.socket.emit('variables to server', this.getDirtyVariables());
      } else {
        throw new Error('Socket not available');
      }
    };

    this.getDirtyVariables = function() {
      return this.variables.filter(function(variable) {
        return variable.dirty && variable.dirty === true;
      });
    };

    // Start constructor
    this.init = function(socket) {
      var _this = this;
      this.setSocket(socket);

      // Update new server data when it is available
      $rootScope.$watch(function() {
        return Styleguide.variables.data;
      }, function(newValue) {
        if (newValue) {
          serverData = newValue;
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
