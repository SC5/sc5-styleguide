'use strict';

describe('sgApp module registration', function() {

  var module;

  before(function() {
    module = angular.mock.module('sgApp');
  });

  it('should be registered', function() {
    expect(module).not.to.equal(null);
  });
});
