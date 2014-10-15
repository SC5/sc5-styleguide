'use strict';

describe('Controller: MainCtrl', function() {

  var ctrl,
    scope,
    httpBackend,
    json,
    localstorage;

  // Load the controller's module
  beforeEach(angular.mock.module('sgApp'));

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, $httpBackend, localStorageService) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    localstorage = localStorageService;

    ctrl = $controller('MainCtrl', {
      $scope: scope
    });

    json = {sections:[{heading: 'Title'}, {heading: 'Title2'}]};

    httpBackend.expectGET('styleguide.json').
      respond(json);
    httpBackend.expectGET('views/main.html').
      respond('');
    httpBackend.expectGET('views/sections.html').
      respond('');

    httpBackend.flush();
  }));

  it('should be defined', function() {
    expect(ctrl).not.to.equal(null);
  });

  it('search parameter should be cleared after search', function() {
    scope.search = 'test';
    scope.clearSearch();
    expect(scope.search).to.be.empty;
  });

  it('should get section data from json', function() {
    expect(scope.sections).to.eql(json.sections);
  });

  describe('getting markup visible state from localstorage', function() {

    it('should return true with true values', function() {
      sinon.stub(localstorage, 'get').returns(true);
      scope.checkIfMarkupVisible();
      expect(scope.showAllMarkup).to.eql(true);
    });

    it('should return true by default', function() {
      sinon.stub(localstorage, 'get');
      scope.checkIfMarkupVisible();
      expect(scope.showAllMarkup).to.eql(true);
    });

    it('should return false with false string value', function() {
      sinon.stub(localstorage, 'get').returns('false');
      scope.checkIfMarkupVisible();
      expect(scope.showAllMarkup).to.eql(false);
    });

    it('should return false with false boolean value', function() {
      sinon.stub(localstorage, 'get').returns(false);
      scope.checkIfMarkupVisible();
      expect(scope.showAllMarkup).to.eql(false);
    });

    it('should return true with unknown values', function() {
      sinon.stub(localstorage, 'get').returns('foobar');
      scope.checkIfMarkupVisible();
      expect(scope.showAllMarkup).to.eql(true);
    });

  });

});
