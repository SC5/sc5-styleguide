import { expect } from 'chai';
import parser  from '~/lib/modules/kss-parser';

describe('KSS parser', () => {

  function parse(files) {
    return parser.parseKssSections(files, {});
  }

  function expectOrder(expected) {
    return (sections) => {
      var order = sections.map((section) => {
        return section.reference;
      });
      expect(order).to.eql(expected);
    };
  }

  it('does not crash on empty .less file', (done) => {
    var files = { 'file1.less': '' };
    parse(files).then((sections) => {
      expect(sections.length).to.eql(0);
    }).then(done).catch(done);
  });

  it('does not crash on empty .sass file', (done) => {
    var files = { 'file1.sass': '' };
    parse(files).then((sections) => {
      expect(sections.length).to.eql(0);
    }).then(done).catch(done);
  });

  it('does not crash on empty .scss file', (done) => {
    var files = { 'file1.scss': '' };
    parse(files).then((sections) => {
      expect(sections.length).to.eql(0);
    }).then(done).catch(done);
  });

  it('parses sections from multiple files', (done) => {
    var files = {
      'file1.less': `// Styleguide 1.0`,
      'file2.scss': `// Styleguide 2.0

// Styleguide 2.1

// Styleguide 2.2`,
      'file3.scss': `// Styleguide 3.0`
    };
    parse(files).then((sections) => {
      expect(sections.length).to.eql(5);
    }).then(done).catch(done);
  });

  it('should parse markdown in header correctly', (done) => {
    var files = {
      'file.less': `// This should be __strong__.
//
// Styleguide 1.0`
    };
    parse(files).then((sections) => {
      expect(sections[0].header).to.eql('This should be <strong>strong</strong>.');
    }).then(done).catch(done);
  });

  it('should allow HTML in header', (done) => {
    var files = {
      'file.less': `// This should be <strong>strong</strong>.
//
// Styleguide 1.0`
    };
    parse(files).then((sections) => {
      expect(sections[0].header).to.eql('This should be <strong>strong</strong>.');
    }).then(done).catch(done);
  });

  it('should format paragraphs correctly', (done) => {
    var files = {
      'file.less': `// Header
//
// First paragraph
//
// Second paragraph
//
// Styleguide 1.0`
    };
    parse(files).then((sections) => {
      expect(sections[0].description).to.eql('<p class="sg">First paragraph</p>\n<p class="sg">Second paragraph</p>\n');
    }).then(done).catch(done);
  });

  it('should parse markdown in description correctly', (done) => {
    var files = {
      'file.less': `// Header
        //
        // This should be __strong__.
        //
        // Styleguide 1.0`
    };
    parse(files).then((sections) => {
      expect(sections[0].description).to.eql('<p class="sg">This should be <strong>strong</strong>.</p>\n');
    }).then(done).catch(done);
  });

  it('should allow HTML in description', (done) => {
    var files = {
      'file.less': `        // Header
        //
        // This should be <strong>strong</strong>.
        //
        // Styleguide 1.0`
    };
    parse(files).then((sections) => {
      expect(sections[0].description).to.eql('<p class="sg">This should be <strong>strong</strong>.</p>\n');
    }).then(done).catch(done);
  });

  it('sorts sections numerically according to first level', (done) => {
    var file = {
      'file1.less': `// Styleguide 10

      // Styleguide 2

      // Styleguide 1`
    },
    order = ['1', '2', '10'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts sub-sections numerically according to second level', (done) => {
    var file = {
      'file2.less': `// Styleguide 2.10

      // Styleguide 3

      // Styleguide 2.2

      // Styleguide 2.1`
    },
    order = ['2.1', '2.2', '2.10', '3'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts sub-sub-sections numerically according to third level', (done) => {
    var file = {
      'file3.less': `// Styleguide 3.1.10

        // Styleguide 3.2

        // Styleguide 4

        // Styleguide 3.1.2

        // Styleguide 3.1.1`
    },
    order = ['3.1.1', '3.1.2', '3.1.10', '3.2', '4'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('sorts arbitrarily deep sub-sections correctly', (done) => {
    var file = {
      'file4.less': `// Styleguide 1.2.3.4.10

         // Styleguide 1.2.3.4.5.6.7

         // Styleguide 1.2.4.19

         // Styleguide 1.2.4.2`
    },
    order = ['1.2.3.4.5.6.7', '1.2.3.4.10', '1.2.4.2', '1.2.4.19'];
    parse(file).then(expectOrder(order)).then(done).catch(done);
  });

  it('parses section reference 1.0 as 1', (done) => {
    var file = {
      'file1.less': `// Styleguide 2.0

        // Styleguide 1.0`
    };
    parse(file).then(expectOrder(['1', '2'])).then(done).catch(done);
  });

  it('should store correct syntax', (done) => {
    var files = {
      'file1.less': `// Styleguide 1.0`,
      'file2.scss': `// Styleguide 2.0`
    };
    parse(files).then((sections) => {
      expect(sections[0].syntax).to.eql('less');
      expect(sections[1].syntax).to.eql('scss');
    }).then(done).catch(done);
  });

  it('ignores trailing dot when parsing section reference', (done) => {
    var file = {
      'file1.less': `// Styleguide 1.2.`
    };
    parse(file).then(expectOrder(['1.2'])).then(done).catch(done);
  });

  it('rejects with error if two sections are defined with same reference number', (done) => {
    var file = {
      'file1.less': `// Foo
        //
        // Styleguide 1.1

        // Bar
        //
        // Styleguide 1.1`
    };
    parse(file).done(() => {
      done(Error('expected promise to reject'));
    }, (err) => {
      expect(err.message).to.eql('Two sections defined with same number 1.1: "Foo" and "Bar"');
      done();
    });
  });

});
