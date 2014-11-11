/*
 * Styleguide.js
 *
 * Handles styleguide data
 */

'use strict';

angular.module('sgApp')
  .service('Styleguide', ['$http', '$rootScope', 'Socket', function($http, $rootScope, Socket) {

    var _this = this;

    this.sections = {};
    this.config = {};
    this.status = {
      compileError: false
    };

    this.get = function() {
      return $http({
        method: 'GET',
        url: 'styleguide.json'
      }).success(function(response) {
        _this.config.data = response.config;
        _this.sections.data = response.sections;
      });
    };

    Socket.on('styleguide compile error', function() {
      _this.status.compileError = true;
    });

    Socket.on('styleguide compile success', function() {
      _this.status.compileError = false;
    });

    $rootScope.$on('styles changed', function() {
      _this.get();
    });

    // Get initial data
    this.get();
  }]);
