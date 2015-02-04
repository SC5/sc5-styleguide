var chai = require('chai'),
    expect = chai.expect,
    gonzales = require('gonzales-pe');

describe('gonzales-pe', function() {

  var syntax = {
    sass: {
      name: 'sass',
      inequality: '$a: 1 != 2',
      braces: '$a: ceil((1.75))',
      error: '$a = foo'
    },
    scss: {
      name: 'scss',
      inequality: '$a: 1 != 2',
      braces: '$a: ceil((1.75))',
      error: '$a = foo'
    }
  };

  checkSyntax(syntax.sass);
  checkSyntax(syntax.scss);

});

function checkSyntax(syntax) {

  describe(syntax.name, function() {

    var ast;

    it('should parse inequality', function() {
      ast = parse(syntax.name, syntax.inequality);
      expect(ast).to.be.an('object');
      expect(ast.type).to.eql('stylesheet');
    });

    it('should parse multiple braces in functions', function() {
      ast = parse(syntax.name, syntax.braces);
      expect(ast).to.be.an('object');
      expect(ast.type).to.eql('stylesheet');
    });

    it('should return error message with invalid syntax', function(done) {
      try {
        parse(syntax.name, syntax.error);
        done(new Error('No error was thrown'));
      } catch (e) {
        var msg = e.toString();
        expect(e.line).to.eql(1);
        expect(e.syntax).to.eql(syntax.name);
        expect(msg).to.contain('Parsing error: Please check the validity of the block starting from line #1');
        expect(msg).to.contain('1*| ' + syntax.error);
        done();
      }
    });
  });

}

function parse(syntax, str) {
  return gonzales.parse(str, { syntax: syntax });
}
