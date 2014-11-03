'use strict';

describe('Controller: MainCtrl', function() {

  var ctrl,
    scope,
    httpBackend,
    json,
    localstorage,
    variablesService,
    styleguideMock,
    json = {
      sections: {
        data: [
          {heading: 'Title'},
          {heading: 'Title2'}
        ]
      }
    };

  // Load the controller's module
  beforeEach(angular.mock.module('sgApp'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('Styleguide', json);
      $provide.value('Variables', {
        init: function() {},
        getSocket: function() {
          return {
            then: function() {}
          }
        }
      });
    });
  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope, Variables, $httpBackend, localStorageService) {

    localstorage = localStorageService;
    httpBackend = $httpBackend;
    variablesService = Variables;

    scope = $rootScope.$new();

    ctrl = $controller('MainCtrl', {
      $scope: scope,
      Variables: variablesService
    });

    httpBackend.expectGET('views/main.html').respond('');
    httpBackend.expectGET('views/sections.html').respond('');

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

  it('should have markup shown by default', function() {
    expect(scope.markup.isVisible).to.eql(true);
  });

  it('should change markup visibility when toggling state', function() {
    scope.toggleMarkup();
    expect(scope.markup.isVisible).to.eql(false);
  });

  it('should persist new state when toggling state', function() {
    scope.toggleMarkup();
    scope.$digest();
    expect(localstorage.get('markup').isVisible).to.eql(false);
  });

  it('should hide designer tool by default', function() {
    expect(scope.designerTool.isVisible).to.eql(false);
  });

  it('should persist new state when designer tool visibility is changed', function() {
    scope.designerTool.isVisible = true;
    scope.$digest();
    expect(localstorage.get('designerTool').isVisible).to.eql(true);
  });
});
