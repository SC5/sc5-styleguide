'use strict';

describe('Service: Variables', function() {
  var Variables,
    styleguideMock,
    rootScope;

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(module(function($provide) {
    styleguideMock = {
      config: {
        data: {
          settings: {
            setting1: 'value1',
            setting2: 'value2'
          }
        }
      }
    };
    $provide.value('Styleguide', styleguideMock);
  }));

  beforeEach(function() {
    inject(function(_Variables_, $rootScope) {
      rootScope = $rootScope;
      window.io = sinon.spy();
      Variables = _Variables_;
    });
  });

  it('should get default values from Styleguide service', function() {
    rootScope.$digest();
    expect(Variables.variables).to.eql({setting1: 'value1', setting2: 'value2'});
  });

  it('should change values properly', function() {
    rootScope.$digest();
    Variables.setValues({setting1: 'changed'});
    rootScope.$digest();
    expect(Variables.variables).to.eql({setting1: 'changed', setting2: 'value2'});
  });

  it('should remove local values that does not exist on server side without changing existing ones', function() {
    rootScope.$digest();
    styleguideMock.config.data = {
      settings: {
        setting2: 'changed value2'
      }
    };
    rootScope.$digest();
    expect(Variables.variables).to.eql({setting2: 'value2'});
  });

  it('should allow new server side keys with new values', function() {
    rootScope.$digest();
    styleguideMock.config.data = {
      settings: {
        setting1: 'value1',
        setting2: 'value2',
        setting3: 'value3'
      }
    }
    rootScope.$digest();
    Variables.setValues({setting3: 'new value'});
    expect(Variables.variables).to.eql({setting1: 'value1', setting2: 'value2', setting3: 'new value'});
  });
});
