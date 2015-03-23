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

  it('should return error message with invalid syntax', function(done) {
    var invalid = '$a = foo', msg;
    try {
      gonzales.srcToAST({ syntax: 'sass', src: invalid });
      done(new Error('No error was thrown'));
    } catch (e) {
      msg = e.toString();
      expect(e.line).to.eql(1);
      expect(e.syntax).to.eql('sass');
      expect(msg).to.contain('Parsing error: Please check the validity of the block starting from line #1');
      expect(msg).to.contain('1*| ' + invalid);
      done();
    }
  });

});
