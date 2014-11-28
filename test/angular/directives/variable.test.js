describe('Variable directive', function() {
  var $scope, elem, html;

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

  it('should extend colors stored in the compact format', function() {
    $scope.variable.value = '#c4f';
    $scope.$apply();
    expect($scope.color.value).to.eql('#cc44ff');
  });

  it('should store value back in the compact format if it was originally in that format', function() {
    $scope.variable.value = '#c4f';
    $scope.$apply();
    $scope.color.value = '#ff55dd';
    $scope.$apply();
    expect($scope.variable.value).to.eql('#f5d');
  });

  it('should store value back in the extended format if it was originally in that format', function() {
    $scope.variable.value = '#cc44ff';
    $scope.$apply();
    $scope.color.value = '#ff55dd';
    $scope.$apply();
    expect($scope.variable.value).to.eql('#ff55dd');
  });
});
