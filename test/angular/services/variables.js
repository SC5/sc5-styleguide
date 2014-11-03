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

  it('should remove local values that does not exist on server side', function() {
    rootScope.$digest();
    delete styleguideMock.config.data.settings.setting1;
    Variables.setValues({});
    expect(Variables.variables).to.eql({setting2: 'value2'});
  });

  it('should allow new server side keys', function() {
    rootScope.$digest();
    styleguideMock.config.data.settings.setting3 = 'default';
    Variables.setValues({});
    Variables.setValues({setting3: 'new value'});
    expect(Variables.variables).to.eql({setting1: 'value1', setting2: 'value2', setting3: 'new value'});
  });
});
