describe('shadowDom directive', function() {

  var $scope, elem, shadowRoot, originalCreateShadowRoot, result,
    styleguideMock,
    userStyleTemplate = '<style>@import(\'style.css\');</style>',
    html = '<shadow-dom><p>hi!</p></shadow-dom>';

  beforeEach(module('sgApp'));

  beforeEach(module(function($provide) {
    styleguideMock = {
      config: {
        data: {}
      }
    };
    $provide.value('Styleguide', styleguideMock);
  }));

  describe('when Element.createShadowRoot is a function', function() {
    before(mockCreateShadowRoot);
    after(restoreCreateShadowRoot);
    beforeEach(create);

    it('creates a shadow root', function() {
      expect(shadowRoot).not.to.eql(undefined);
    });

    it('appends userStyles.html template contents to shadowRoot as first child', function() {
      expect(shadowRoot.childNodes[0].outerHTML).to.eql(userStyleTemplate);
    });

    it('appends tag contents into shadowRoot after styles', function() {
      expect(shadowRoot.childNodes[1].outerHTML).to.eql('<p class="ng-scope">hi!</p>');
    });
  });

  describe('when Element.createShadowRoot is a not a function', function() {
    before(disableCreateShadowRoot);
    after(restoreCreateShadowRoot);
    beforeEach(create);

    it('does not create a shadow root', function() {
      expect(shadowRoot).to.eql(undefined);
    });

    it('appends shadow-dom tag contents as is', function() {
      expect(elem.html()).to.eql('<p class="ng-scope">hi!</p>');
    });
  });

  describe('when disableEncapsulation config parameter is enabled', function() {
    beforeEach(module(function($provide) {
      styleguideMock = {
        config: {
          data: {
            disableEncapsulation: true
          }
        }
      };
      $provide.value('Styleguide', styleguideMock);
    }));

    beforeEach(create);

    it('does not create a shadow root', function() {
      expect(shadowRoot).to.eql(undefined);
    });

    it('appends shadow-dom tag contents as is', function() {
      expect(elem.html()).to.eql('<p class="ng-scope">hi!</p>');
    });
  });

  function mockCreateShadowRoot() {
    originalCreateShadowRoot = Element.prototype.createShadowRoot;
    if (typeof Element.prototype.createShadowRoot !== 'function') {
      Element.prototype.createShadowRoot = function() {
        shadowRoot = document.createElement('div');
        return shadowRoot;
      };
    }
  }

  function disableCreateShadowRoot() {
    originalCreateShadowRoot = Element.prototype.createShadowRoot;
    Element.prototype.createShadowRoot = undefined;
  }

  function restoreCreateShadowRoot() {
    Element.prototype.createShadowRoot = originalCreateShadowRoot;
  }

  function create() {
    shadowRoot = undefined;
    inject(function($compile, $rootScope, $templateCache) {
      $templateCache.put('userStyles.html', userStyleTemplate);
      $scope = $rootScope.$new();
      elem = angular.element(html);
      result = $compile(elem)($scope);
      $scope.$apply();
    });
  }

});
