/*
 * Styleguide.js
 *
 * Handles styleguide data
 */

'use strict';

angular.module('sgApp')
  .service('Styleguide', function($http, $rootScope) {

    var _this = this;

    this.sections = {};
    this.config = {};

    this.get = function() {
      return $http({
        method: 'GET',
        url: 'styleguide.json'
      }).success(function(response) {
        _this.config.data = response.config;
        _this.sections.data = response.sections;
        console.log(_this.sections.data);
      });
    }

    $rootScope.$on('styles changed', function() {
      _this.get();
    });

  });
