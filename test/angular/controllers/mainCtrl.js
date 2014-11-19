'use strict';

describe('Controller: MainCtrl', function() {

  var ctrl,
    scope,
    httpBackend,
    localstorage,
    variablesService,
    styleguideMock,
    styleguideData = {
      sections: {
        data: [
          {
            header: 'Section header text',
            reference: '1'
          },
          {
            header: 'Sub section header text',
            parentReference: '1',
            reference: '1.1'
          }
        ]
      },
      config: {
        data: {
          title: 'Page Title'
        }
      }
    };

  // Load the controller's module
  beforeEach(angular.mock.module('sgApp'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('Styleguide', styleguideData);
      $provide.value('Variables', {
        init: function() {}
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

    httpBackend.whenGET('views/main.html').respond('');
    httpBackend.whenGET('views/sections.html').respond('');
    httpBackend.flush();
    localStorageService.clearAll();
  }));

  it('should be defined', function() {
    expect(ctrl).not.to.equal(null);
  });

  it('search parameter should be cleared after search', function() {
    scope.search = 'test';
    scope.clearSearch();
    expect(scope.search).to.be.empty;
  });

  it('should get section data from styleguide data', function() {
    expect(scope.sections).to.eql(styleguideData.sections);
  });

  it('should have markup shown by default', function() {
    expect(scope.markupSection.isVisible).to.eql(true);
  });

  it('should change markup visibility when toggling state', function() {
    scope.toggleMarkup();
    expect(scope.markupSection.isVisible).to.eql(false);
  });

  it('should persist new state when toggling state', function() {
    scope.toggleMarkup();
    scope.$digest();
    expect(localstorage.get('markupSection').isVisible).to.eql(false);
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
