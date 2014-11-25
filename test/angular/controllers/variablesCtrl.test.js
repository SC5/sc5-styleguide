'use strict';

describe('VariablesCtrl', function() {

  var ctrl,
    rootScope,
    scope,
    location,
    stateParams,
    styleguideData;

  beforeEach(function() {
    angular.mock.module('sgApp');
    initData();
    initController();
  });

  it('should be defined', function() {
    expect(ctrl).not.to.eql(undefined);
  });

  it('clears $rootScope.currentSection', function() {
    rootScope.currentSection = '123';
    initController();
    expect(rootScope.currentSection).to.eql('');
  });

  it('calls scope.clearSearch', function() {
    expect(scope.clearSearch).to.have.been.called;
  });

  it('sets variable name from stateParams to scope.currentVariable', function() {
    expect(scope.currentVariable).to.eql('bg-color');
  });

  it('redirects to url "overview" if stateParams.variableName is undefined', function() {
    delete stateParams.variableName;
    var locationUrl = sinon.spy(location, 'url');
    initController();
    expect(locationUrl).to.have.been.calledWith('overview');
  });

  it('scope.getLevel() returns always "sub"', function() {
    expect(scope.getLevel()).to.eql('sub');
    expect(scope.getLevel(1)).to.eql('sub');
    expect(scope.getLevel('thingy')).to.eql('sub');
  });

  describe('scope.relatedSections', function() {

    it('contains a section listing the current variable in its variables', function() {
      expect(scope.currentVariable).to.eql('bg-color');
      expect(scope.relatedSections).to.eql([styleguideData.sections.data[0]]);
    });

    it('is updated on $rootScope "styles changed" event', function() {
      scope.currentVariable = 'main-font';
      rootScope.$emit('styles changed');
      expect(scope.relatedSections).to.eql(styleguideData.sections.data);
    });

    it('is empty if no section lists the current variable in its variables', function() {
      scope.currentVariable = 'unknown-foo-variable';
      rootScope.$emit('styles changed');
      expect(scope.relatedSections).to.eql([]);
    });

    it('is empty if Styleguide.sections is not available', function() {
      delete styleguideData.sections;
      rootScope.$emit('styles changed');
      expect(scope.relatedSections).to.eql([]);
    });

    it('is empty if Styleguide.sections.data is not available', function() {
      delete styleguideData.sections.data;
      rootScope.$emit('styles changed');
      expect(scope.relatedSections).to.eql([]);
    });

  });

  function initData() {
    stateParams = {
      variableName: 'bg-color'
    };

    styleguideData = {
      sections: {
        data: [
          {
            header: 'Main Section',
            reference: '1',
            variables: ['bg-color', 'main-font']
          },
          {
            header: 'Sub section',
            reference: '1.1',
            variables: ['main-font']
          }
        ]
      }
    };
  }

  function initController() {
    inject(function($controller, $rootScope, $location) {
      rootScope = $rootScope;
      scope = $rootScope.$new();
      scope.clearSearch = sinon.spy();
      location = $location;
      ctrl = $controller('VariablesCtrl', {
        $rootScope: rootScope,
        $scope: scope,
        $stateParams: stateParams,
        $location: location,
        Styleguide: styleguideData
      });
    });
  }

});
