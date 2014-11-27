describe('Design directive', function() {
  var $scope, elem, directive, html;

  beforeEach(module('sgApp'));

  beforeEach(function() {
    module(function($provide) {
      $provide.value('Styleguide', {});
      $provide.value('Variables', {
        init: function() {}
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
});
