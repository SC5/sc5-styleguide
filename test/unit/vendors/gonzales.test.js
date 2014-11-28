var requireModule = require('requirefrom')('lib/modules'),
    gulp = require('gulp'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    gonzales = require('gonzales-pe');

describe('Gonzales', function() {

  describe('SASS', function() {

    it('Should take inequality', function() {
      var str = multiline(function() {
        /*
$a: 1 != 2;
        */
      });

      ast = gonzales.srcToAST({
        src: str,
        syntax: 'sass'
      });
      expect(ast).to.be.an('array');
    });

    it('Should take multiple braces in functions', function() {
      var str = multiline(function() {
        /*
$a: cell((1.75));
        */
      });

      ast = gonzales.srcToAST({
        src: str,
        syntax: 'sass'
      });
      expect(ast).to.be.an('array');
    });

  });

  describe('SCSS', function() {

    it('Should take inequality', function() {
      var str = multiline(function() {
        /*
$a: 1 != 2;
        */
      });

      ast = gonzales.srcToAST({
        src: str,
        syntax: 'scss'
      });
      expect(ast).to.be.an('array');
    });

    it('Should take multiple braces in functions', function() {
      var str = multiline(function() {
        /*
$a: cell((1.75));
        */
      });

      ast = gonzales.srcToAST({
        src: str,
        syntax: 'scss'
      });
      expect(ast).to.be.an('array');
    });
  });

});
