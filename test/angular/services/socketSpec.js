'use strict';

describe('Service: Socket', function() {
  var service,
    rootScope,
    fakeIo,
    fakeSocket;

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(function() {
    fakeSocket = sinon.stub({
      on: function() {},
      emit: function() {}
    });

    window.io = fakeIo = {
      connect: sinon.stub().returns(fakeSocket)
    };

    inject(function(_Socket_, $rootScope) {
      rootScope = $rootScope;
      service = _Socket_;
    });
  });

  it('connects to path "/" using window.io if it is available', function() {
    expect(fakeIo.connect).to.have.been.calledWith('/');
  });

  it('registers listener for socket "connect" event', function() {
    expect(fakeSocket.on).to.have.been.calledWith('connect');
  });

  it('registers listener for socket "disconnect" event', function() {
    expect(fakeSocket.on).to.have.been.calledWith('disconnect');
  });

  it('registers listener for socket "error" event', function() {
    expect(fakeSocket.on).to.have.been.calledWith('error');
  });

});
