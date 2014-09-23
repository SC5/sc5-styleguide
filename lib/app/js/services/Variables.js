(function() {

  'use strict';

  var Variables = function($http, $q) {

    var deferred = $q.defer;

    // Input validation
    if (typeof $http === 'undefined' || $http === null) {
      throw "No $http provided!";
    }

    this.settingsUrl = '../../sass/_styleguide_variables.scss';

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

    // Read the settings file TODO: better parser
    fs.readFile(settingsUrl, function (err, data) {
      if (err) {
        deferred.reject('Error reading file at ' + settingsUrl);
      } else {
        deferred.resolve(data);
      }
    });

    

  };

  angular.module('sgApp').service('Variables', ['$http', '$q', Variables]);

}());

