'use strict';

describe('Service: Variables', function() {

  var Variables,
    Styleguide,
    httpBackend,
    response,
    socket,
    values = {},
    q,
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
    styleguideMock = {
      get: function() {}
    };

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(
    module(function($provide) {
      $provide.value('Styleguide', styleguideMock);
    }));

  beforeEach(function() {
    inject(function($q) {
      styleguideMock.get = function() {
        var deferred = $q.defer();
        deferred.resolve(json);
        return deferred.promise;
      }
    });
  });

  beforeEach(function() {
    inject(function(_Variables_) {
      Variables = _Variables_;
    });
  });

  it('should get settings object from styleguide.json', function(done) {
    inject(function($rootScope) {
      Variables.init().then(function() {
        expect(Variables.variables).to.eql({setting1: 'value1', setting2: 'value2'});
        done();
      });
      $rootScope.$apply();
    });
  });

  it('should respect locally set values', function(done) {
    inject(function($rootScope) {
      Variables.setValues({setting1: 'changed', setting3: 'newValue'});
      Variables.init().then(function() {
        expect(Variables.variables).to.eql({setting1: 'changed', setting2: 'value2', setting3: 'newValue'});
        done();
      });
      $rootScope.$apply();
    });
  });
});
