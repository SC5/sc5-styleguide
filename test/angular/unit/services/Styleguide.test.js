describe('Service: Styleguide', function() {

  'use strict';

  var service,
    http,
    rootScope,
    socketService,
    debounce = sinon.stub().returnsArg(1),
    json = {
      config: {
        foo: 'bar'
      },
      variables: ['a', 'b'],
      sections: ['1', '2']
    };

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(module(function($provide) {
    socketService = {
      eventHandlers: {},
      isAvailable: sinon.stub(),
      emit: sinon.spy(),
      isConnected: sinon.stub(),
      connect: sinon.spy(),
      on: sinon.spy(function(event, handler) {
        socketService.eventHandlers[event] = socketService.eventHandlers[event] || [];
        socketService.eventHandlers[event].push(handler);
      })
    };
    $provide.value('Socket', socketService);
    $provide.value('debounce', debounce);
  }));

  beforeEach(function() {
    inject(function($httpBackend, $rootScope, _Styleguide_) {
      http = $httpBackend;
      rootScope = $rootScope;
      service = _Styleguide_;
    });

    http.whenGET('styleguide.json').respond(json);
  });

  it('GETs styleguide.json on initialization', function() {
    http.expectGET('styleguide.json');
    http.flush();

    http.verifyNoOutstandingExpectation();
    http.verifyNoOutstandingRequest();
  });

  it('GETs styleguide.json $rootScope broadcast event "styles changed"', function() {
    http.flush();
    http.resetExpectations();
    http.expectGET('styleguide.json');
    rootScope.$broadcast('styles changed');
    http.flush();

    http.verifyNoOutstandingExpectation();
    http.verifyNoOutstandingRequest();
  });

  it('GETs styleguide.json $rootScope broadcast event "progress end"', function() {
    http.flush();
    http.resetExpectations();
    http.expectGET('styleguide.json');
    rootScope.$broadcast('progress end');
    http.flush();

    http.verifyNoOutstandingExpectation();
    http.verifyNoOutstandingRequest();
  });

  it('debounces #get by 800ms', function() {
    expect(debounce).to.have.been.calledWith(800, sinon.match.func);
  });

  describe('.get()', function() {

    beforeEach(function() {
      http.expectGET('styleguide.json');
      service.get();
      http.flush();
    });

    it('GETs styleguide.json', function() {
      http.verifyNoOutstandingExpectation();
      http.verifyNoOutstandingRequest();
    });

    it('stores response json config as config.data', function() {
      expect(service.config.data).to.deep.equal(json.config);
    });

    it('stores response json variables as variables.data', function() {
      expect(service.variables.data).to.deep.equal(json.variables);
    });

    it('stores response json sections as sections.data', function() {
      expect(service.sections.data).to.deep.equal(json.sections);
    });

    describe('after completion', function() {

      beforeEach(function() {
        socketService.connect.reset();
        socketService.isConnected.reset();
      });

      it('does not connect Socket if already connected', function() {
        socketService.isConnected.returns(true);
        service.get();
        http.flush();

        expect(socketService.isConnected).to.have.been.calledOnce;
        expect(socketService.connect).not.to.have.been.calledOnce;
      });

      describe('if Socket is not connected', function() {

        beforeEach(function() {
          socketService.isConnected.returns(false);
          service.get();
          http.flush();
        });

        it('connects Socket', function() {
          expect(socketService.isConnected).to.have.been.calledOnce;
          expect(socketService.connect).to.have.been.calledOnce;
        });

      });

    });

  });

  describe('socket event listener', function() {

    describe('for "styleguide compile error"', function() {

      var error = { name: 'compile error', message: 'compile failed' };

      beforeEach(function() {
        service.status.hasError = false;
        service.status.error = { old: 'value' };
        service.status.errType = 'shouldChange';
        socketService.eventHandlers['styleguide compile error'][0].call(undefined, error);
      });

      it('is registered', function() {
        expect(socketService.on).to.have.been.calledWith('styleguide compile error', sinon.match.func);
      });

      it('sets Styleguide.status.hasError to true', function() {
        expect(service.status.hasError).to.eql(true);
      });

      it('sets Styleguide.status.error to error object', function() {
        expect(service.status.error).to.deep.eql(error);
      });

      it('sets Styleguide.status.errType to compile', function() {
        expect(service.status.errType).to.eql('compile');
      });

    });

    describe('for "styleguide validation error"', function() {

      var error = { name: 'validation error', message: 'validation failed' };

      beforeEach(function() {
        service.status.hasError = false;
        service.status.error = { old: 'value' };
        service.status.errType = 'shouldChange';
        socketService.eventHandlers['styleguide validation error'][0].call(undefined, error);
      });

      it('is registered', function() {
        expect(socketService.on).to.have.been.calledWith('styleguide validation error', sinon.match.func);
      });

      it('sets Styleguide.status.hasError to true', function() {
        expect(service.status.hasError).to.eql(true);
      });

      it('sets Styleguide.status.error to error object', function() {
        expect(service.status.error).to.deep.eql(error);
      });

      it('sets Styleguide.status.errType to validation', function() {
        expect(service.status.errType).to.eql('validation');
      });

    });

    describe('for "styleguide compile success"', function() {

      var error = { name: 'old error', message: 'old message' },
        errType = 'old type';

      beforeEach(function() {
        service.status.hasError = true;
        service.status.error = error;
        service.status.errType = errType;
        socketService.eventHandlers['styleguide compile success'][0].call(undefined);
      });

      it('is registered', function() {
        expect(socketService.on).to.have.been.calledWith('styleguide compile success', sinon.match.func);
      });

      it('sets Styleguide.status.hasError to false', function() {
        expect(service.status.hasError).to.eql(false);
      });

      it('leaves Styleguide.status.error untouched', function() {
        expect(service.status.error).to.deep.eql(error);
      });

      it('leaves Styleguide.status.errType untouched', function() {
        expect(service.status.errType).to.eql(errType);
      });

    });

  });

  describe('status', function() {

    describe('initially', function() {

      it('does not have error', function() {
        expect(service.status.hasError).to.eql(false);
      });

      it('error is empty object', function() {
        expect(service.status.error).to.eql({});
      });

      it('errType is empty string', function() {
        expect(service.status.errType).to.eql('');
      });

    });

  });

});
