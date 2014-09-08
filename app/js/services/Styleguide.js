/*
 * Styleguide.js
 *
 * Handles styleguide data
 */

'use strict';

angular.module('sgApp')
  .factory('Styleguide', function ($http) {
    function get() {
      return $http({
          method: 'GET',
          url: 'styleguide.json'
        });
    }

    return {
      get: get
    };
  });