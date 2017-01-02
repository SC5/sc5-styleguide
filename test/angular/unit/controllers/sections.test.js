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

    httpBackend.whenGET('overview.html').respond('');
    httpBackend.whenGET('views/main.html').respond('');
    httpBackend.whenGET('views/sections.html').respond('');
    httpBackend.whenGET('views/404.html').respond('');
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

  describe('empty main section detection', function() {
    it('should return true if main section', function() {
      var section = {
        header: 'Section header text',
        reference: '1',
        renderMarkup: '',
        markup: ''
      };
      expect(scope.isMainSection(section)).to.eql(true);
    });

    it('should return true for empty main sections', function() {
      var section = {
        header: 'Section header text',
        reference: '1',
        renderMarkup: '',
        markup: ''
      };
      expect(scope.isEmptyMainSection(section)).to.eql(true);
    });

    it('should return false for empty sub sections', function() {
      var section = {
        header: 'Section header text',
        reference: '1.1',
        renderMarkup: '',
        markup: ''
      };
      expect(scope.isEmptyMainSection(section)).to.eql(false);
    });

    it('should return false for section that has markup', function() {
      var section = {
        header: 'Section header text',
        reference: '1',
        renderMarkup: '<p>Test</p>',
        markup: '<p>Test</p>'
      };
      expect(scope.isEmptyMainSection(section)).to.eql(false);
    });
  });

  describe('section filtering', function() {
    it('should return true if showing all sections', function() {
      scope.currentSection = 'all';
      expect(scope.filterSections({reference: '1'})).to.eql(true);
      expect(scope.filterSections({reference: '2'})).to.eql(true);
      expect(scope.filterSections({reference: 'foo'})).to.eql(true);
    });

    it('should return true for current section', function() {
      scope.currentSection = '1';
      expect(scope.filterSections({reference: '1'})).to.eql(true);
    });

    it('should return false if section is a subsection of main section', function() {
      scope.currentSection = '1';
      styleguideData.config.data = {
        hideSubsectionsOnMainSection: true
      };
      expect(scope.filterSections({reference: '1.2'})).to.eql(false);
      expect(scope.filterSections({reference: '1.1.2'})).to.eql(false);
    });

    it('should return false if section is not sub section of current section', function() {
      scope.currentSection = '2';
      expect(scope.filterSections({reference: '1.2'})).to.eql(false);
      expect(scope.filterSections({reference: '1.1.2'})).to.eql(false);
    });

    it('should return false if current section is 1 and section reference is 10', function() {
      scope.currentSection = '1';
      expect(scope.filterSections({reference: '1'})).to.eql(true);
      expect(scope.filterSections({reference: '1.0'})).to.eql(false);
      expect(scope.filterSections({reference: '1.1'})).to.eql(false);
      expect(scope.filterSections({reference: '10'})).to.eql(false);
      expect(scope.filterSections({reference: '10.0'})).to.eql(false);
      expect(scope.filterSections({reference: '10.1'})).to.eql(false);
    });

    it('should return false for undefined reference', function() {
      expect(scope.filterSections({})).to.eql(false);
    });
  });
});
