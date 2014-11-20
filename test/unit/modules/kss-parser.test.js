var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    parser  = requireModule('kss-parser');

describe('KSS parser', function() {
  var files;
  beforeEach(function() {
    var str = multiline(function() {
      /*
      // Section
      //
      // Styleguide 1.2

      // Section
      //
      // Styleguide 1.0

      // Section
      //
      // Styleguide 2.0
      */
    }),
    str2 = multiline(function() {
      /*
      // Section
      //
      // Styleguide 1.1
      */
    });
    files = {'file1.scss': str, 'file2.scss': str2};
  });

  it('should parse sections from all files', function(done) {
    parser.parseKSS(files, {}).then(function(styleguide) {
      expect(styleguide.sections.length).to.eql(4);
      done();
    }).catch(function(error) {
      done(error);
    });
  });

  it('should list sections in the correct order', function(done) {
    parser.parseKSS(files, {}).then(function(styleguide) {
      expect(styleguide.sections[0].reference).to.eql('1');
      expect(styleguide.sections[1].reference).to.eql('1.1');
      expect(styleguide.sections[2].reference).to.eql('1.2');
      expect(styleguide.sections[3].reference).to.eql('2');
      done();
    }).catch(function(error) {
      done(error);
    });
  });
});
