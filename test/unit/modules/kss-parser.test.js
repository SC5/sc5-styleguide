var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    parser  = requireModule('kss-parser');

describe('KSS parser', function() {

  function parse() {
    var files = {};
    Array.prototype.slice.call(arguments).forEach(function(file, idx) {
      files['file' + idx] = file;
    });
    return parser.parseKSS(files, {});
  }

  function expectOrder(expected) {
    return function(styleguide) {
      var order = styleguide.sections.map(function(section) {
        return section.reference;
      });
      expect(order).to.eql(expected);
    };
  }

  var file1, file2, file3, file4;

  beforeEach(function() {
    file1 = multiline(function() {
      /*
      // Styleguide 10

      // Styleguide 2

      // Styleguide 1
      */
    });
    file2 = multiline(function() {
      /*
      // Styleguide 2.10

      // Styleguide 3

      // Styleguide 2.2

      // Styleguide 2.1
      */
    });
    file3 = multiline(function() {
      /*
      // Styleguide 3.1.10

      // Styleguide 3.2

      // Styleguide 4

      // Styleguide 3.1.2

      // Styleguide 3.1.1
      */
    });
    file4 = multiline(function() {
       /*
       // Styleguide 1.2.3.4.10

       // Styleguide 1.2.3.4.5.6.7

       // Styleguide 1.2.4.19

       // Styleguide 1.2.4.2
       */
    });
  });

  it('parses sections from multiple files', function(done) {
    parse(file1, file2, file3).then(function(styleguide) {
      expect(styleguide.sections.length).to.eql(12);
    }).then(done).catch(done);
  });

  it('sorts sections numerically according to first level', function(done) {
    var order = ['1', '2', '10'];
    parse(file1).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts sub-sections numerically according to second level', function(done) {
    var order = ['2.1', '2.2', '2.10', '3'];
    parse(file2).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts sub-sub-sections numerically according to third level', function(done) {
    var order = ['3.1.1', '3.1.2', '3.1.10', '3.2', '4'];
    parse(file3).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts arbitrarily deep sub-sections correctly', function(done) {
    var order = ['1.2.3.4.5.6.7', '1.2.3.4.10', '1.2.4.2', '1.2.4.19'];
    parse(file4).then(expectOrder(order)).then(done).catch(done);
  });

  it('parses section reference 1.0 as 1', function(done) {
    var file = multiline(function() {
      /*
      // Styleguide 2.0

      // Styleguide 1.0
      */
    });
    parse(file).then(expectOrder(['1', '2'])).then(done).catch(done);
  });

  it('ignores trailing dot when parsing section reference', function(done) {
    parse('//Styleguide 1.2.').then(expectOrder(['1.2'])).then(done).catch(done);
  });

});
