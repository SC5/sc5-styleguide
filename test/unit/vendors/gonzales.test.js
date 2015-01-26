var chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    gonzales = require('gonzales-pe');

describe('Gonzales', function() {

  var ast;

  describe('SASS', function() {

    it('Should take inequality', function() {
      var str = multiline(function() {
        /*
$a: 1 != 2;
        */
      });

      ast = gonzales.parse(str, {
        syntax: 'sass'
      });
      expect(ast).to.be.an('object');
    });

    it('Should take multiple braces in functions', function() {
      var str = multiline(function() {
        /*
$a: cell((1.75));
        */
      });

      ast = gonzales.parse(str, {
        syntax: 'sass'
      });
      expect(ast).to.be.an('object');
    });

  });

  describe('SCSS', function() {

    it('Should take inequality', function() {
      var str = multiline(function() {
        /*
$a: 1 != 2;
        */
      });

      ast = gonzales.parse(str, {
        syntax: 'scss'
      });
      expect(ast).to.be.an('object');
    });

    it('Should take multiple braces in functions', function() {
      var str = multiline(function() {
        /*
$a: cell((1.75));
        */
      });

      ast = gonzales.parse(str, {
        syntax: 'scss'
      });
      expect(ast).to.be.an('object');
    });
  });

});
