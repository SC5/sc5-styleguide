(function() {

  'use strict';

  var Variables = function() {

    var settingsUrl = '../../sass/_styleguide_variables.scss',
      socket,
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

    this.setValues = function(newValues, override) {
      if (typeof newValues === 'undefined' || newValues === null) {
        throw 'Invalid values!'
      }

      if (override) {
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
      socket = newSocket;
      return this;
    };

  };

  angular.module('sgApp').service('Variables', [Variables]);

}());

