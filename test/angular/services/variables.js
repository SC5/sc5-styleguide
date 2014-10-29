'use strict';

describe('Service: Variables', function() {
  var Variables,
    json = {
      data: {
        config: {
          settings: {
            setting1: 'value1',
            setting2: 'value2'
          }
        }
      }
    },
    styleguideMock = {};

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(module(function($provide) {
    $provide.value('Styleguide', styleguideMock);
  }));

  beforeEach(inject(function($q) {
    styleguideMock.get = function() {
      var deferred = $q.defer();
      deferred.resolve(json);
      return deferred.promise;
    }
  }));

  beforeEach(function() {
    inject(function(_Variables_) {
      window.io = sinon.spy();
      Variables = _Variables_;
    });
  });

  it('should get default values from Styleguide service', function(done) {
    inject(function($rootScope) {
      Variables.init().then(function() {
        expect(Variables.variables).to.eql({setting1: 'value1', setting2: 'value2'});
        done();
      });
      $rootScope.$apply();
    });
  });

  it('should respect locally set values before initialization', function(done) {
    inject(function($rootScope) {
      Variables.setValues({setting1: 'changed', setting3: 'newValue'});
      Variables.init().then(function() {
        expect(Variables.variables).to.eql({setting1: 'changed', setting2: 'value2', setting3: 'newValue'});
        done();
      });
      $rootScope.$apply();
    });
  });

  it('should make call to document root', function(done) {
    inject(function($rootScope) {
      Variables.getSocket().then(function(response) {
        expect(window.io.calledWith('/')).to.be.ok;
        done();
      });
      $rootScope.$apply();
    });
  });

});
