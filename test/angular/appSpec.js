'use strict';

describe('sgApp module registration', function() {

  var module;

  before(function() {
    module = angular.module('sgApp', [
      'ui.router',
      'ngAnimate',
      'colorpicker.module',
      'hljs',
      'LocalStorageModule',
      'oc.lazyLoad'
    ]);
  });

  it('should be registered', function() {
    expect(module).not.to.equal(null);
  });
});
