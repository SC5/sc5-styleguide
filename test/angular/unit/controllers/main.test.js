'use strict';

describe('Controller: MainCtrl', function() {

  var ctrl,
    scope,
    httpBackend,
    localstorage,
    variablesService,
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
          title: 'Page Title',
          showMarkupSection: true
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

    httpBackend.whenGET('overview.html').respond('');
    httpBackend.whenGET('views/main.html').respond('');
    httpBackend.whenGET('views/sections.html').respond('');
    httpBackend.whenGET('views/404.html').respond('');
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
    expect(scope.markupSection.isVisible).to.eql(styleguideData.config.data.showMarkupSection);
  });

  describe('toggle sideNav', function() {
    it('should inverse boolean', function() {
      scope.showMenu = true;
      expect(scope.toggleSideNav(scope.showMenu)).to.eql(false);
    });
  });

  describe('Navigation', function() {
    it('should return sideNav string if sideNav configuration option is set', function() {
      scope.config.data.sideNav = true;
      expect(scope.isSideNav()).to.eql('sideNav');
    });
    it('should return topNav string if sideNav configuration option is not set', function() {
      scope.config.data.sideNav = false;
      expect(scope.isSideNav()).to.eql('topNav');
    });

    it('should return - string if hideSubsectionsOnMainSection configuration option is true', function() {
      scope.config.data.hideSubsectionsOnMainSection = true;
      expect(scope.isMainSectionNavigable()).to.eql('-');
    });

    it('should return app.index.section({section: section.reference}) string if hideSubsectionsOnMainSection configuration option is false', function() {
      scope.config.data.hideSubsectionsOnMainSection = false;
      expect(scope.isMainSectionNavigable()).to.eql('app.index.section({section: section.reference})');
    });

  });

  describe('sideNav configuration option true', function() {
    it('should return sideNav if sideNav configuration option is set true', function() {
      scope.config.data.sideNav = true;
      expect(scope.isSideNav()).to.eql('sideNav');
    });
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

  describe('main section filtering', function() {
    it('should return true for main sections', function() {
      expect(scope.filterMainSections()({reference: '1'})).to.eql(true);
    });

    it('should return false for sub sections', function() {
      expect(scope.filterMainSections()({reference: '1.2'})).to.eql(false);
      expect(scope.filterMainSections()({reference: '1.1.2'})).to.eql(false);
    });

    it('should return true if section has sub section', function() {
      expect(scope.hasSubsections({reference: '1'})).to.eql(true);
    });

    it('should return false for undefined reference', function() {
      expect(scope.filterMainSections()({})).to.eql(false);
    });
  });

  describe('subsection filtering', function() {
    it('should return true when section is subsection of defined section', function() {
      expect(scope.filterSubsections({reference: '1'})({reference: '1.1'})).to.eql(true);
    });

    it('should return false when section is subsubsection of defined section', function() {
      expect(scope.filterSubsections({reference: '1'})({reference: '1.1.2'})).to.eql(false);
    });

    it('should return true when section is subsubsection of defined subsection', function() {
      expect(scope.filterSubsections({reference: '1.1'})({reference: '1.1.2'})).to.eql(true);
    });

    it('should return false for sections on the same lever', function() {
      expect(scope.filterSubsections({reference: '1'})({reference: '2'})).to.eql(false);
    });

    it('should return false for undefined parent section', function() {
      expect(scope.filterSubsections({})({reference: '1.1'})).to.eql(false);
    });

    it('should return false for undefined child section', function() {
      expect(scope.filterSubsections({reference: '1.1'})({})).to.eql(false);
    });
  });
});
