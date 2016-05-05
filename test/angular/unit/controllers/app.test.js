'use strict';

describe('Controller: AppCtrl', function(){
  var appCtrl, scope, $rootScope, ngProgressFactory, ngProgress, sandbox;

  beforeEach(function(){
    sandbox = sinon.sandbox.create();
  });

  afterEach(function(){
    sandbox.restore();
  });

  beforeEach(angular.mock.module('sgApp'));

  beforeEach(inject(function($controller, _$rootScope_){
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();

    ngProgress = {
      setHeight: function(){},
      setColor: function(){},
      start: function(){},
      complete: function(){},
      reset: function(){}
    };
    sinon.stub(ngProgress);

    ngProgressFactory = { createInstance: function(){} };
    sinon.stub(ngProgressFactory, 'createInstance', function(){
      return ngProgress;
    });

    appCtrl = $controller('AppCtrl', {
      $scope: scope,
      ngProgressFactory: ngProgressFactory
    });
  }));

  it('should set the default progress bar height.', function(){
    expect(ngProgress.setHeight).to.have.been.calledWith('');
  });

  it('should set the default progress bar color.', function(){
    expect(ngProgress.setColor).to.have.been.calledWith('');
  });

  describe('on load progress start events', function(){
    beforeEach(function(){
      $rootScope.$broadcast('progress start');
    });

    it('should start the progress bar.', function(){
      expect(ngProgress.start).to.have.been.called;
    });
  });

  describe('on load progress end events', function(){
    beforeEach(function(){
      $rootScope.$broadcast('progress end');
    });

    it('should start the progress bar.', function(){
      expect(ngProgress.complete).to.have.been.called;
    });
  });

  describe('on socket disconnect events', function(){
    beforeEach(function(){
      $rootScope.$broadcast('socket disconnected');
    });

    it('should reset the progress bar.', function(){
      expect(ngProgress.reset).to.have.been.called;
    });
  });
});
