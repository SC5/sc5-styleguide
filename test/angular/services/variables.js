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
            setting1: {value: 'value1', index: 0},
            setting2: {value: 'value2', index: 1}
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
    expect(Variables.variables).to.eql({
      setting1: {value: 'value1', index: 0},
      setting2: {value: 'value2', index: 1}
    });
  });

  it('should change values properly', function() {
    rootScope.$digest();
    Variables.variables.setting1.value = 'changed';
    rootScope.$digest();
    expect(Variables.variables).to.eql({
      setting1: {value: 'changed', index: 0},
      setting2: {value: 'value2', index: 1}
    });
  });

  it('should remove local values that does not exist on server side without changing existing ones', function() {
    rootScope.$digest();
    styleguideMock.config.data = {
      settings: {
        setting2: {value: 'changed value', index: 0}
      }
    };
    rootScope.$digest();
    expect(Variables.variables).to.eql({
      setting2: {value: 'value2', index: 0}
    });
  });

  it('should properly reset local changes', function() {
    rootScope.$digest();
    Variables.variables.setting1.value = 'changed1';
    Variables.variables.setting2.value = 'changed2';
    Variables.resetLocal();
    rootScope.$digest();
    expect(Variables.variables).to.eql({
      setting1: {value: 'value1', index: 0},
      setting2: {value: 'value2', index: 1}
    });
  });

  it('should allow new server side keys without losing local changes', function() {
    rootScope.$digest();
    styleguideMock.config.data = {
      settings: {
        setting1: {value: 'new value1', index: 0},
        setting2: {value: 'new value2', index: 1},
        setting3: {value: 'value3', index: 2}
      }
    }
    rootScope.$digest();
    expect(Variables.variables).to.eql({
      setting1: {value: 'value1', index: 0},
      setting2: {value: 'value2', index: 1},
      setting3: {value: 'value3', index: 2}
    });
  });

  it('should handle properly index changes without losing local changes', function() {
    rootScope.$digest();
    styleguideMock.config.data = {
      settings: {
        setting1: {value: 'new value1', index: 1},
        setting2: {value: 'new value2', index: 0}
      }
    };
    rootScope.$digest();
    expect(Variables.variables).to.eql({
      setting1: {value: 'value1', index: 1},
      setting2: {value: 'value2', index: 0}
    });
  })
});
