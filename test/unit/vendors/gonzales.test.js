import { expect } from 'chai';
import gonzales from 'gonzales-pe';

describe('Gonzales', function() {

  var ast;

  describe('SASS', function() {

    it('Should take inequality', function() {
      var str = `$a: 1 != 2;`;

      ast = gonzales.parse(str, {
        syntax: 'sass'
      });
      expect(ast).to.be.an('object');
    });

    it('Should take multiple braces in functions', function() {
      var str = `$a: cell((1.75));`;

      ast = gonzales.parse(str, {
        syntax: 'sass'
      });
      expect(ast).to.be.an('object');
    });

  });

  describe('SCSS', function() {

    it('Should take inequality', function() {
      var str = `$a: 1 != 2;`;

      ast = gonzales.parse(str, {
        syntax: 'scss'
      });
      expect(ast).to.be.an('object');
    });

    it('Should take multiple braces in functions', function() {
      var str = `$a: cell((1.75));`;

      ast = gonzales.parse(str, {
        syntax: 'scss'
      });
      expect(ast).to.be.an('object');
    });
  });

  describe('LESS', function() {

    it('should parse extends', function() {
      var str = `.animal {
  background-color: black;
  color: white;
}
.bear {
  &:extend(.animal);
  background-color: brown;
}`;

      ast = gonzales.parse(str, {
        syntax: 'less'
      });
      expect(ast).to.be.an('object');
    });

  });

  it('should return error message with invalid syntax', function(done) {
    var invalid = '$a = foo', msg;
    try {
      gonzales.parse(invalid, { syntax: 'sass' });
      done(new Error('No error was thrown'));
    } catch (e) {
      msg = e.toString();
      expect(e.line).to.eql(1);
      expect(e.syntax).to.eql('sass');
      expect(msg).to.contain('Parsing error: Please check validity of the block starting from line #1');
      expect(msg).to.contain('1*| ' + invalid);
      done();
    }
  });

});
