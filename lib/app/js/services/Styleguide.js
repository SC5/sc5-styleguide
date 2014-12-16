/*
 * Styleguide.js
 *
 * Handles styleguide data
 */

'use strict';

angular.module('sgApp')
  .service('Styleguide', function($http, $rootScope, Socket) {

    var _this = this;

    this.sections = {};
    this.config = {};
    this.variables = {};
    this.status = {
      hasError: false,
      error: {}
    };

    this.get = function() {
      return $http({
        method: 'GET',
        url: 'styleguide.json'
      }).success(function(response) {
        _this.config.data = response.config;
        _this.variables.data = response.variables;
        _this.sections.data = response.sections;
      });
    };

    Socket.on('styleguide compile error', function(err) {
      _this.status.hasError = true;
      _this.status.error = err;
    });

    Socket.on('styleguide compile success', function() {
      _this.status.hasError = false;
    });

    $rootScope.$on('styles changed', function() {
      _this.get();
    });

    // Get initial data
    this.get();
  });
