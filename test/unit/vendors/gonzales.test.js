var requireModule = require('requirefrom')('lib/modules'),
    gulp = require('gulp'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    gonzales = require('gonzales-pe');

var util = require('util');

describe('Gonzales', function() {

  describe('Should parse Bootsrap variables', function() {
    var str = multiline(function() {
      /*
$bootstrap-sass-asset-helper: (twbs-font-path("") != unquote('twbs-font-path("")')) !default;
$font-size-large: ceil(($font-size-base * 1.25)) !default; // ~18px
      */
    }),
      result = [ 'stylesheet',
        [ 'declaration',
          [ 'property',
            [ 'variable', [ 'ident', 'bootstrap-sass-asset-helper' ] ] ],
          [ 'propertyDelim' ],
          [ 's', ' ' ],
          [ 'value',
            [ 'braces',
              '(',
              ')',
              [ 'function',
                [ 'ident', 'twbs-font-path' ],
                [ 'arguments', [ 'string', '""' ] ] ],
              [ 's', ' ' ],
              [ 'operator', '!=' ],
              [ 's', ' ' ],
              [ 'function',
                [ 'ident', 'unquote' ],
                [ 'arguments', [ 'string', '\'twbs-font-path("")\'' ] ] ] ],
            [ 's', ' ' ],
            [ 'default' ] ] ],
        [ 'declDelim' ],
        [ 's', '\n' ],
        [ 'declaration',
          [ 'property', [ 'variable', [ 'ident', 'font-size-large' ] ] ],
          [ 'propertyDelim' ],
          [ 's', ' ' ],
          [ 'value',
            [ 'function',
              [ 'ident', 'ceil' ],
              [ 'arguments',
                [ 'braces',
                  '(',
                  ')',
                  [ 'variable', [ 'ident', 'font-size-base' ] ],
                  [ 's', ' ' ],
                  [ 'ident', '*' ],
                  [ 's', ' ' ],
                  [ 'number', '1.25' ] ] ] ],
            [ 's', ' ' ],
            [ 'default' ] ] ],
        [ 'declDelim' ],
        [ 's', ' ' ],
        [ 'commentSL', ' ~18px' ] ];

    it('SASS', function() {
      ast = gonzales.srcToAST({
        src: str,
        syntax: 'sass'
      });
      expect(ast).eql(result);
    });

    it('SCSS', function() {
      ast = gonzales.srcToAST({
        src: str,
        syntax: 'scss'
      });
      expect(ast).eql(result);
    });

  });

});
