'use strict';

describe('SectionsCtrl', function() {

  var ctrl,
    scope,
    stateParams,
    rootScope,
    httpBackend,
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
  beforeEach(inject(function($controller, $rootScope, $httpBackend) {
    rootScope = $rootScope;
    httpBackend = $httpBackend;
    scope = $rootScope.$new();
    stateParams = {
      section: '1.1'
    };

    httpBackend.whenGET('views/main.html').respond('');
    httpBackend.whenGET('views/sections.html').respond('');
    ctrl = $controller('SectionsCtrl', {
      $scope: scope,
      $stateParams: stateParams
    });
  }));

  it('should be defined', function() {
    expect(ctrl).not.to.equal(null);
  });

  it('should contain correct title', function() {
    rootScope.$digest();
    expect(rootScope.pageTitle).to.eql('1.1 Sub section header text - Page Title');
  });

  it('should refresh title when new data is available', function() {
    rootScope.$digest();
    styleguideData.sections.data = [{
      header: 'Section header text',
      reference: '1'
    },
    {
      header: 'Changed section header',
      parentReference: '1',
      reference: '1.1'
    }];
    styleguideData.config.data = {
          title: 'New Page Title'
    };
    rootScope.$digest();
    expect(rootScope.pageTitle).to.eql('1.1 Changed section header - New Page Title');
  });
});
