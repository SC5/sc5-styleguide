describe('Design directive', function() {
  var $scope, elem, html, variables;

  beforeEach(module('sgApp'));

  beforeEach(function() {
    variables = [
      { name: 'var1', value: 'a' },
      { name: 'var2', value: 'b' }
    ];
    module(function($provide) {
      $provide.value('Styleguide', {});
      $provide.value('Variables', {
        init: function() {},
        variables: variables
      });
    });
  });

  beforeEach(function() {
    html = '<div sg-design></div>';

    inject(function($compile, $rootScope, $templateCache) {
      $templateCache.put('views/partials/design.html', '<div></div>');
      $scope = $rootScope.$new();

      $scope.sections = {
        data: [
          {
            header: 'Section title',
            reference: '1'
          },
          {
            header: 'Section title',
            parentReference: '1',
            reference: '1.1',
            variables: ['var1']
          },
          {
            header: 'Section title',
            parentReference: '1.1',
            reference: '1.1.1',
            variables: ['var2']
          },
          {
            header: 'Section title',
            reference: '2.0',
            variables: ['var3']
          }
        ]
      };

      elem = angular.element(html);
      $compile(elem)($scope);
      $scope.$apply();
    });

  });

  it('should list child variables from sub sections if current section does not have any', function() {
    $scope.currentReference.section = $scope.sections.data[0];
    $scope.$apply();
    expect($scope.relatedChildVariableNames).to.eql(['var1', 'var2']);
  });

  it('should not report dirty variables to be found when all variables are clean', function() {
    expect($scope.dirtyVariablesFound()).to.eql(false);
  });

  it('should not report dirty variables to be found when one variable dirty property is false', function() {
    variables[0].dirty = false;
    expect($scope.dirtyVariablesFound()).to.eql(false);
  });

  it('should report dirty variables to be found when one variable is dirty', function() {
    variables[0].dirty = true;
    expect($scope.dirtyVariablesFound()).to.eql(true);
  });

});
