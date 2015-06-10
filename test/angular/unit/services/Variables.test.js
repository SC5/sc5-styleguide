'use strict';

describe('Service: Variables', function() {
  var socketEventListeners = {},
      Variables,
      styleguideMock,
      mockSocketService,
      rootScope,
      log;

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(module(function($provide) {
    mockSocketService = {
      on: function(event, cb) {
        socketEventListeners[event] = cb;
      },
      emit: function() {}
    };

    styleguideMock = {
      variables: {
        data: [
          {file: 'file', name: 'setting1', value: 'value1', line: 1},
          {file: 'file', name: 'setting2', value: 'value2', line: 2}
        ]
      },
      status: {
        hasErrors: false
      }
    };
    $provide.value('Styleguide', styleguideMock);
    $provide.value('Socket', mockSocketService);
  }));

  beforeEach(function() {
    inject(function(_Variables_, $rootScope, $log) {
      rootScope = $rootScope;
      Variables = _Variables_;
      log = $log;
    });
  });

  it('should get default values from Styleguide service', function() {
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should not have local changes by default', function() {
    rootScope.$digest();
    expect(Variables.refreshDirtyStates()).to.eql(false);
  });

  it('should detect if there is local changes', function() {
    rootScope.$digest();
    Variables.variables[0].value = 'changed';
    rootScope.$digest();
    expect(Variables.refreshDirtyStates()).to.eql(true);
  });

  it('should set empty array as server data no variables are found', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [];
    rootScope.$digest();
    expect(Variables.variables).to.eql([]);
  });

  it('should not mark server side changes as dirty', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'new value1', line: 1},
      {file: 'file', name: 'setting2', value: 'new value2', line: 2}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'new value1', line: 1},
      {file: 'file', name: 'setting2', value: 'new value2', line: 2}
    ]);
  });

  it('should allow same named variables from different files', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2},
      {file: 'file2', name: 'setting1', value: 'value1', line: 1},
      {file: 'file2', name: 'setting2', value: 'value2', line: 2}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2},
      {file: 'file2', name: 'setting1', value: 'value1', line: 1},
      {file: 'file2', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should change values properly and mark them as dirty', function() {
    rootScope.$digest();
    Variables.variables[0].value = 'changed';
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'changed', dirty: true, line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should not mark variable as dirty if it is from different file', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2},
      {file: 'file2', name: 'setting1', value: 'value1', line: 1}
    ];
    rootScope.$digest();
    Variables.variables[2].value = 'changed';
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2},
      {file: 'file2', name: 'setting1', value: 'changed', dirty: true, line: 1}
    ]);
  });

  it('should remove dirty marker when value is changed back to original', function() {
    rootScope.$digest();
    Variables.variables[0].value = 'changed';
    rootScope.$digest();
    Variables.variables[0].value = 'value1';
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should remove dirty marking when variable is changed back', function() {
    rootScope.$digest();
    Variables.variables[0].value = 'changed';
    rootScope.$digest();
    Variables.variables[0].value = 'value1';
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should not lose local changes when updating server side data', function() {
    rootScope.$digest();
    Variables.variables[1].value = 'changed2';
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'new value1', line: 1},
      {file: 'file', name: 'setting2', value: 'new value2', line: 2}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'new value1', line: 1},
      {file: 'file', name: 'setting2', value: 'changed2', dirty: true, line: 2}
    ]);
  });

  it('should remove local values that does not exist on server side', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should update line numbers even though value has not changed', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'value1', line: 100},
      {file: 'file', name: 'setting2', value: 'value2', line: 101}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 100},
      {file: 'file', name: 'setting2', value: 'value2', line: 101}
    ]);
  });

  it('should update line numbers even when value has changed', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'new value1', line: 100},
      {file: 'file', name: 'setting2', value: 'new value2', line: 101}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'new value1', line: 100},
      {file: 'file', name: 'setting2', value: 'new value2', line: 101}
    ]);
  });

  it('should properly reset local changes', function() {
    rootScope.$digest();
    Variables.variables[0].value = 'changed1';
    Variables.variables[1].value = 'changed2';
    Variables.resetLocal();
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2}
    ]);
  });

  it('should allow new server side variables at the end of the data', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2},
      {file: 'file', name: 'setting3', value: 'value3', line: 3}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting2', value: 'value2', line: 2},
      {file: 'file', name: 'setting3', value: 'value3', line: 3}
    ]);
  });

  it('should allow new server side variables between existing variables', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting3', value: 'value3', line: 2},
      {file: 'file', name: 'setting2', value: 'value2', line: 3}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting1', value: 'value1', line: 1},
      {file: 'file', name: 'setting3', value: 'value3', line: 2},
      {file: 'file', name: 'setting2', value: 'value2', line: 3}
    ]);
  });

  it('should handle properly mixed index changes and new variables', function() {
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting3', value: 'value3', line: 1},
      {file: 'file', name: 'setting4', value: 'value4', line: 2},
      {file: 'file', name: 'setting2', value: 'value2', line: 3},
      {file: 'file', name: 'setting1', value: 'value1', line: 4}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting3', value: 'value3', line: 1},
      {file: 'file', name: 'setting4', value: 'value4', line: 2},
      {file: 'file', name: 'setting2', value: 'value2', line: 3},
      {file: 'file', name: 'setting1', value: 'value1', line: 4}
    ]);
  });

  it('should handle properly index changes without losing local changes', function() {
    rootScope.$digest();
    Variables.variables[0].value = 'new value1';
    Variables.variables[1].value = 'new value2';
    rootScope.$digest();
    styleguideMock.variables.data = [
      {file: 'file', name: 'setting2', value: 'value2', line: 1},
      {file: 'file', name: 'setting1', value: 'value1', line: 2},
      {file: 'file', name: 'setting3', value: 'value3', line: 3}
    ];
    rootScope.$digest();
    expect(Variables.variables).to.eql([
      {file: 'file', name: 'setting2', value: 'new value2', dirty: true, line: 1},
      {file: 'file', name: 'setting1', value: 'new value1', dirty: true, line: 2},
      {file: 'file', name: 'setting3', value: 'value3', line: 3}
    ]);
  });

  describe('saving variables', function() {

    var emitSpy;

    beforeEach(function() {
      emitSpy = sinon.spy(mockSocketService, 'emit');
    });

    it('throws exception if socket is not available', function(done) {
      Variables.setSocket(null);
      try {
        Variables.saveVariables();
        done(Error('expected error to be thrown'));
      } catch (err) {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.eql('Socket not available');
        done();
      }
    });

    it('emits "variables to server" event via socket', function() {
      Variables.saveVariables();
      expect(emitSpy).to.have.been.calledWith('variables to server');
    });

    it('sends only dirty variables to server', function() {
      rootScope.$digest();
      Variables.variables[0].value = 'changed value';
      rootScope.$digest();
      Variables.saveVariables();
      var dirtyVars = [Variables.variables[0]];
      expect(emitSpy).to.have.been.calledWith('variables to server', dirtyVars);
    });

  });

  describe('socket event listener', function() {

    var broadcastSpy,
        socketEventBroadcasts = {
          'styleguide progress start': ['progress start'],
          'styleguide progress end': ['progress end'],
          'styleguide styles changed': ['styles changed']
        };

    beforeEach(function() {
      broadcastSpy = sinon.spy(rootScope, '$broadcast');
    });

    Object.keys(socketEventBroadcasts).forEach(function(socketEvent) {

      describe('for "' + socketEvent + '"', function() {

        it('is registered', function() {
          expect(socketEventListeners[socketEvent]).to.be.an('function');
        });

        socketEventBroadcasts[socketEvent].forEach(function(broadcastEvent) {

          it('should broadcast "' + broadcastEvent + '" via $rootScope', function() {
            socketEventListeners[socketEvent].call();
            expect(broadcastSpy).to.have.been.calledWith(broadcastEvent);
          });

        });

      });
    });

  });

});
