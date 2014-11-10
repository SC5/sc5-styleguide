describe('Service: Socket', function() {

  'use strict';

  var service,
    rootScope,
    fakeIo,
    fakeSocket;

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(function() {
    fakeSocket = {
      listeners: {},
      on: sinon.spy(function(event, listener) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(listener);
      }),
      emit: sinon.spy(function(event, data, cb) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(function(fn) {
            fn.call(undefined, data);
          })
        }
        if (cb) {
          cb.call(undefined);
        }
      })
    };

    window.io = fakeIo = {
      connect: sinon.stub().returns(fakeSocket)
    };

    inject(function(_Socket_, $rootScope) {
      rootScope = $rootScope;
      service = _Socket_;
    });
  });

  it('connects to path "/" using window.io', function() {
    expect(fakeIo.connect).to.have.been.calledWith('/');
  });

  describe('socket event listener', function() {

    var broadcast;
    beforeEach(function() {
      broadcast = sinon.spy(rootScope, '$broadcast');
    });

    it('for "connect" is broadcast via $rootScope as "socket connected" event', function() {
      fakeSocket.emit('connect');
      expect(broadcast).to.have.been.calledWith('socket connected');
    });

    it('for "disconnect" is broadcast via $rootScope as "socket disconnected" event', function() {
      fakeSocket.emit('disconnect');
      expect(broadcast).to.have.been.calledWith('socket disconnected');
    });

    it('for "error" is broadcast via $rootScope as "socket error" event with error object', function() {
      var err = { message: 'stuff failed' };
      fakeSocket.emit('error', err);
      expect(broadcast).to.have.been.calledWith('socket error', err);
    });

  });

  describe('.on(eventName, listenerFn)', function() {

    var listener, apply;

    beforeEach(function() {
      listener = sinon.spy();
      apply = sinon.spy(rootScope, '$apply');
      service.on('onTest', listener);
    });

    it('registers socket event listener with the same name', function() {
      expect(fakeSocket.listeners.onTest.length).to.eql(1);
    });

    it('applies the listener function through $rootScope.$apply', function() {
      fakeSocket.emit('onTest');
      expect(apply).to.have.been.called;
      expect(listener).to.have.been.called;
    });

  });

  describe('.emit(eventName, data, callback)', function() {
    var data, callback, apply;

    beforeEach(function() {
      data = { a: 123 };
      callback = sinon.spy();
      apply = sinon.spy(rootScope, '$apply');
    });

    it('emits a socket event with the same name', function() {
      service.emit('emitTest');
      expect(fakeSocket.emit).to.have.been.calledWith('emitTest');
    });

    it('passes the given data object to socket.emit', function() {
      service.emit('emitTest', data);
      expect(fakeSocket.emit).to.have.been.calledWith('emitTest', data);
    });

    it('applies the callback through $rootScope.$apply', function() {
      service.emit('emitTest', data, callback);
      expect(apply).to.have.been.called;
      expect(callback).to.have.been.called;
    });

  });

  describe('.isConnected', function() {

    it('returns initially false', function() {
      expect(service.isConnected()).to.eql(false);
    });

    it('returns true after socket has emitted "connect" event', function() {
      fakeSocket.emit('connect');
      expect(service.isConnected()).to.eql(true);
    });

    it('returns false after socket has emitted "disconnect" event', function() {
      fakeSocket.emit('connect');
      expect(service.isConnected()).to.eql(true);
      fakeSocket.emit('disconnect');
      expect(service.isConnected()).to.eql(false);
    });

  });

});
