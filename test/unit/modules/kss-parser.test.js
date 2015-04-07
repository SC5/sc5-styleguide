var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    parser  = requireModule('kss-parser');

describe('KSS parser', function() {

  function parse(files) {
    return parser.parseKssSections(files, {});
  }

  function expectOrder(expected) {
    return function(sections) {
      var order = sections.map(function(section) {
        return section.reference;
      });
      expect(order).to.eql(expected);
    };
  }

  it('does not crash on empty .less file', function(done) {
    var files = { 'file1.less': '' };
    parse(files).then(function(sections) {
      expect(sections.length).to.eql(0);
    }).then(done).catch(done);
  });

  it('does not crash on empty .sass file', function(done) {
    var files = { 'file1.sass': '' };
    parse(files).then(function(sections) {
      expect(sections.length).to.eql(0);
    }).then(done).catch(done);
  });

  it('does not crash on empty .scss file', function(done) {
    var files = { 'file1.scss': '' };
    parse(files).then(function(sections) {
      expect(sections.length).to.eql(0);
    }).then(done).catch(done);
  });

  it('parses sections from multiple files', function(done) {
    var files = {
      'file1.less': multiline(function() {
        /*
        // Styleguide 1.0
        */
      }),
      'file2.scss': multiline(function() {
        /*
        // Styleguide 2.0

        // Styleguide 2.1

        // Styleguide 2.2
        */
      }),
      'file3.scss': multiline(function() {
        /*
        // Styleguide 3.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections.length).to.eql(5);
    }).then(done).catch(done);
  });

  it('should parse markdown in header correctly', function(done) {
    var files = {
      'file.less': multiline(function() {
        /*
        // This should be __strong__.
        //
        // Styleguide 1.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections[0].header).to.eql('This should be <strong>strong</strong>.');
    }).then(done).catch(done);
  });

  it('should allow HTML in header', function(done) {
    var files = {
      'file.less': multiline(function() {
        /*
        // This should be <strong>strong</strong>.
        //
        // Styleguide 1.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections[0].header).to.eql('This should be <strong>strong</strong>.');
    }).then(done).catch(done);
  });

  it('should format paragraphs correctly', function(done) {
    var files = {
      'file.less': multiline(function() {
        /*
        // Header
        //
        // First paragraph
        //
        // Second paragraph
        //
        // Styleguide 1.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections[0].description).to.eql('<p>First paragraph</p>\n<p>Second paragraph</p>\n');
    }).then(done).catch(done);
  });

  it('should parse markdown in description correctly', function(done) {
    var files = {
      'file.less': multiline(function() {
        /*
        // Header
        //
        // This should be __strong__.
        //
        // Styleguide 1.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections[0].description).to.eql('<p>This should be <strong>strong</strong>.</p>\n');
    }).then(done).catch(done);
  });

  it('should allow HTML in description', function(done) {
    var files = {
      'file.less': multiline(function() {
        /*
        // Header
        //
        // This should be <strong>strong</strong>.
        //
        // Styleguide 1.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections[0].description).to.eql('<p>This should be <strong>strong</strong>.</p>\n');
    }).then(done).catch(done);
  });

  it('sorts sections numerically according to first level', function(done) {
    var file = {'file1.less': multiline(function() {
      /*
      // Styleguide 10

      // Styleguide 2

      // Styleguide 1
      */
    })},
    order = ['1', '2', '10'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts sub-sections numerically according to second level', function(done) {
    var file = {'file2.less': multiline(function() {
      /*
      // Styleguide 2.10

      // Styleguide 3

      // Styleguide 2.2

      // Styleguide 2.1
      */
    })},
    order = ['2.1', '2.2', '2.10', '3'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts sub-sub-sections numerically according to third level', function(done) {
    var file = {'file3.less': multiline(function() {
      /*
        // Styleguide 3.1.10

        // Styleguide 3.2

        // Styleguide 4

        // Styleguide 3.1.2

        // Styleguide 3.1.1
      */
    })},
    order = ['3.1.1', '3.1.2', '3.1.10', '3.2', '4'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts arbitrarily deep sub-sections correctly', function(done) {
    var file = {'file4.less': multiline(function() {
      /*
         // Styleguide 1.2.3.4.10

         // Styleguide 1.2.3.4.5.6.7

         // Styleguide 1.2.4.19

         // Styleguide 1.2.4.2
      */
    })},
    order = ['1.2.3.4.5.6.7', '1.2.3.4.10', '1.2.4.2', '1.2.4.19'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('parses section reference 1.0 as 1', function(done) {
    var file = {
      'file1.less': multiline(function() {
        /*
        // Styleguide 2.0

        // Styleguide 1.0
        */
      })
    };
    parse(file).then(expectOrder(['1', '2'])).then(done).catch(done);
  });

  it('should store correct syntax', function(done) {
    var files = {
      'file1.less': multiline(function() {
        /*
        // Styleguide 1.0
        */
      }),
      'file2.scss': multiline(function() {
        /*
        // Styleguide 2.0
        */
      })
    };
    parse(files).then(function(sections) {
      expect(sections[0].syntax).to.eql('less');
      expect(sections[1].syntax).to.eql('scss');
    }).then(done).catch(done);
  });

  it('ignores trailing dot when parsing section reference', function(done) {
    var file = {
      'file1.less': multiline(function() {
        /*
        // Styleguide 1.2.
        */
      })
    };
    parse(file).then(expectOrder(['1.2'])).then(done).catch(done);
  });

  it('rejects with error if two sections are defined with same reference number', function(done) {
    var file = {
      'file1.less': multiline(function() {
        /*
        // Foo
        //
        // Styleguide 1.1

        // Bar
        //
        // Styleguide 1.1
        */
      })
    };
    parse(file).done(function() {
      done(Error('expected promise to reject'));
    }, function(err) {
      expect(err.message).to.eql('Two sections defined with same number 1.1: "Foo" and "Bar"');
      done();
    });
  });

});
