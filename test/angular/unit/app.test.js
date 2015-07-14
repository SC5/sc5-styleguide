'use strict';

describe('sgApp module', function() {

  var appModule;

  beforeEach(function() {
    appModule = angular.mock.module('sgApp');
  });

  it('should be registered', function() {
    expect(appModule).not.to.equal(null);
  });

  describe('setModifierClass filter', function() {
    var setModifierClass;
    beforeEach(inject(function($filter) {
      setModifierClass = $filter('setModifierClass');
    }));

    it('should replace modifier placeholder properly', function() {
      var input = 'test {$modifiers} test',
        modifierClass = 'modifierClass',
        result = 'test modifierClass test';
      expect(setModifierClass(input, modifierClass)).to.eql(result);
    });

    it('should replace multiple modifiers properly', function() {
      var input = 'test {$modifiers} test {$modifiers}',
        modifierClass = 'modifierClass',
        result = 'test modifierClass test modifierClass';
      expect(setModifierClass(input, modifierClass)).to.eql(result);
    });
  });

  describe('setVariables filter', function() {
    var setVariables;
    beforeEach(inject(function($filter) {
      setVariables = $filter('setVariables');
    }));

    describe('incomplete parameters', function() {
      it('should return empty string if string is not defined', function() {
        expect(setVariables(null, {})).to.eql('');
      });

      it('should return unmodified string if variables is not defined', function() {
        expect(setVariables('test string', null)).to.eql('test string');
      });
    });

    describe('SASS / SCSS "$" variables', function() {
      it('should set a single SASS / SCSS variable correctly', function() {
        var input = 'background: $color;',
          variables = [
            {name: 'color', value: '#FF0000'}
          ],
          result = 'background: #FF0000;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should set multiple SASS / SCSS variables correctly', function() {
        var input = 'background: $bgColor; color: $textColor;',
          variables = [
            {name: 'bgColor', value: '#FF0000'},
            {name: 'textColor', value: '#00FF00'}
          ],
          result = 'background: #FF0000; color: #00FF00;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should set SASS / SCSS variables correctly if the first variable name is seconds substring', function() {
        var input = 'background: $bgColor; color: $bgColor-light;',
          variables = [
            {name: 'bgColor', value: '#FF0000'},
            {name: 'bgColor-light', value: '#00FF00'}
          ],
          result = 'background: #FF0000; color: #00FF00;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should be case sensitive', function() {
        var input = 'background: $test;',
          variables = [
            {name: 'Test', value: '#FF0000'}
          ],
          result = 'background: $test;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should clean up !default suffix', function() {
        var input = 'background: $bgColor;',
          variables = [
            {name: 'bgColor', value: '#FF0000 !default'}
          ],
          result = 'background: #FF0000;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should resolve variables with variable values', function() {
        var input = 'background: $bgColor;',
            variables = [
              {name: 'primary-color', value: '#FF0000'},
              {name: 'bgColor', value: '$primary-color'}
            ],
            result = 'background: #FF0000;';
        expect(setVariables(input, variables)).to.eql(result);
      });
    });

    describe('LESS "@" variables', function() {
      it('should set a single LESS variable correctly', function() {
        var input = 'background: @color;',
          variables = [
            {name: 'color', value: '#FF0000'}
          ],
          result = 'background: #FF0000;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should set multiple LESS variables correctly', function() {
        var input = 'background: @bgColor; color: @textColor;',
          variables = [
            {name: 'bgColor', value: '#FF0000'},
            {name: 'textColor', value: '#00FF00'}
          ],
          result = 'background: #FF0000; color: #00FF00;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should set LESS variables correctly if the first variable name is seconds substring', function() {
        var input = 'background: @bgColor; color: @bgColor-light;',
          variables = [
            {name: 'bgColor', value: '#FF0000'},
            {name: 'bgColor-light', value: '#00FF00'}
          ],
          result = 'background: #FF0000; color: #00FF00;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should be case sensitive', function() {
        var input = 'background: @test;',
          variables = [
            {name: 'Test', value: '#FF0000'}
          ],
          result = 'background: @test;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should clean up !default suffix', function() {
        var input = 'background: @bgColor;',
          variables = [
            {name: 'bgColor', value: '#FF0000 !default'}
          ],
          result = 'background: #FF0000;';
        expect(setVariables(input, variables)).to.eql(result);
      });

      it('should resolve variables with variable values', function() {
        var input = 'background: @bgColor;',
          variables = [
            {name: 'primary-color', value: '#FF0000'},
            {name: 'bgColor', value: '@primary-color'}
          ],
          result = 'background: #FF0000;';
        expect(setVariables(input, variables)).to.eql(result);
      });
    });
  });

  describe('addWrapper filter', function() {

    var addWrapper,
      Styleguide;

    beforeEach(function() {
      Styleguide = {
        config: {
          data: {}
        }
      };

      module(function($provide) {
        $provide.value('Styleguide', Styleguide);
      });

      inject(function($filter) {
        addWrapper = $filter('addWrapper');
      });
    });

    it('should be defined', function() {
      expect(addWrapper).to.be.a('function');
    });

    it('returns input as-is if Styleguide config does not have commonClass', function() {
      var input = 'unchanged';
      expect(addWrapper(input)).to.eql(input);
    });

    it('returns input as-is if Styleguide config is not yet loaded', function() {
      Styleguide = {};
      var input = 'unchanged';
      expect(addWrapper(input)).to.eql(input);
    });

    it('returns input wrapped inside a <sg-common-class-wrapper> tag with common class if Styleguide config has commonClass', function() {
      Styleguide.config.data.commonClass = 'my-common-class';
      var input = 'wrapped',
        expected = '<sg-common-class-wrapper class="my-common-class">wrapped</sg-common-class-wrapper>';
      expect(addWrapper(input)).to.eql(expected);
    });

  });

});
