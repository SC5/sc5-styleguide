(function() {

  'use strict';

  var Variables = function($http, $q) {

    // Input validation
    if (typeof $http === 'undefined' || $http === null) {
      throw "No $http provided!";
    }

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

    this.load = function() {
      // Read the settings file TODO: better parser
      var deferred = $q.defer;
      $http.get(this.settingsUrl)
        .then(function(response) {
          deferred.resolve(response);
        }, function(error) {
          deferred.reject('Error ' + error);
        });
      return deferred;
    };

  };

  angular.module('sgApp').service('Variables', ['$http', '$q', Variables]);

}());

