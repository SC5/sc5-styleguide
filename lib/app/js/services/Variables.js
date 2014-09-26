(function() {

  'use strict';

  var Variables = function() {

    this.settingsUrl = '../../sass/_styleguide_variables.scss';
    this.values = {};

    this.getValue = function(valueName) {
      if (this.values.hasOwnProperty(valueName)) {
        return this.values[valueName];
      }
      else {
        throw 'Invalid value!';
      }
    };

    this.getValues = function() {
      return this.values;
    };

    this.setValue = function(valueName, value) {
      this.values[valueName] = value;
      return this;
    };

    this.setValues = function(values) {
      if (typeof values === 'undefined' || values === null) {
        throw 'Invalid value!'
      }
      for (var valueName in values) {
        if (values.hasOwnProperty(valueName)) {
          this.values[valueName] = values[valueName];
        }
      }
      return this;
    };

  };

  angular.module('sgApp').service('Variables', [Variables]);

}());

