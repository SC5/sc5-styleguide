describe('Variable directive', function() {
  var $scope, scope, elem, directive, linkFn, html;

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
    html = '<div sg-variable></div>';

    inject(function($compile, $rootScope, $templateCache) {
      $templateCache.put('views/partials/variable.html', '<div></div>');
      $scope = $rootScope.$new();
      $scope.variable = {
        value: '#000000'
      };
      elem = angular.element(html);
      $compile(elem)($scope);
      $scope.$apply();
    });

  });

  it('should have correct default value', function() {
    expect($scope.color.value).to.eql('#000000');
  });

  it('should parse color value correctly from the string', function() {
    $scope.variable.value = 'test #ff0000 !default';
    $scope.$apply();
    expect($scope.color.value).to.eql('#ff0000');
  });

  it('should parse only the first color if string has multiple colors', function() {
    $scope.variable.value = 'test #ff0000 #cccccc !default';
    $scope.$apply();
    expect($scope.color.value).to.eql('#ff0000');
  });

  it('replace color in the original string correctly', function() {
    $scope.variable.value = 'test #ff0000 !default';
    $scope.$apply();
    $scope.color.value = '#cccccc';
    $scope.$apply();
    expect($scope.variable.value).to.eql('test #cccccc !default');
  });
});
