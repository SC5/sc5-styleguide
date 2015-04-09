//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    kssSplitter = requireModule('kss-splitter');

describe('KSS splitter', function() {

  describe('Splitter module', function() {
    it('Split 2 blocks of singleline comments', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment1
// Comment1

// Comment2
// Comment2
        */
        }),
        // jscs:enable
        result = [
        { type: 'comment', content: '// Comment1\n// Comment1' },
        { type: 'code', content: '\n\n' },
        { type: 'comment', content: '// Comment2\n// Comment2' }
      ],
      split = kssSplitter.pureSplitter(str);

      expect(split).eql(result);
      //expect(split).eql(null);

    });
  });

  describe('Singleline comment declarations', function() {
    it('should parse single KSS block', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment
// Styleguide 1.0

.a { b: c }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment\n// Styleguide 1.0',
          code: '\n\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should be agnostic to spaces in reference declaration', function() {
      var str = multiline(function() {
        // jscs:disable
        /*
// Comment
//Styleguide 1.0

.a { b: c }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment\n//Styleguide 1.0',
          code: '\n\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should take multiline code', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment
//Styleguide 1.0

.a { b: c }
$a: b;

.x { y: z }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment\n//Styleguide 1.0',
          code: '\n\n.a { b: c }\n$a: b;\n\n.x { y: z }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should allow code blocks to have not KSS comments', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment
//Styleguide 1.0

.a { b: c }

// Simple comment

.x { y: z }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment\n//Styleguide 1.0',
          code: '\n\n.a { b: c }\n\n// Simple comment\n\n.x { y: z }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should parse several blocks', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment1
// Styleguide 1.0

.a { b: c }

// Comment2
// Styleguide 2.0

.x { y: z }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment1\n// Styleguide 1.0',
          code: '\n\n.a { b: c }\n\n'
        },
        {
          kss: '// Comment2\n// Styleguide 2.0',
          code: '\n\n.x { y: z }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should parse several blocks 2', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
@import "test";
// Comment
// Styleguide 1.0

.a { b: c }

// Comment
// Styleguide 2

// Comment
// Styleguide 2.0


.a { b: c }

        */
      }),
      // jscs:enable
      result = [
        {
          kss: '',
          code: '@import "test";\n'
        },
        {
          kss: '// Comment\n// Styleguide 1.0',
          code: '\n\n.a { b: c }\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 2',
          code: '\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 2.0',
          code: '\n\n\n.a { b: c }\n'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should allow blocks with no code', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment1
// Styleguide 1.0

.a { b: c }

// Comment2
// Styleguide 2.0

// Comment3
// Styleguide 3.0

.x { y: z }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment1\n// Styleguide 1.0',
          code: '\n\n.a { b: c }\n\n'
        },
        {
          kss: '// Comment2\n// Styleguide 2.0',
          code: '\n\n'
        },
        {
          kss: '// Comment3\n// Styleguide 3.0',
          code: '\n\n.x { y: z }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should take any reference number', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment
// Styleguide 1

.a { b: c }

// Comment
// Styleguide 1.1

// Comment
// Styleguide 5.1.2.6
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment\n// Styleguide 1',
          code: '\n\n.a { b: c }\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 1.1',
          code: '\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 5.1.2.6',
          code: ''
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should take code before first KSS block', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
.x { y: x }

// Comment
// Styleguide 1.0

.a { b: c }
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '',
          code: '.x { y: x }\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 1.0',
          code: '\n\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });
  });

  describe('Multiline comment declarations', function() {

    it('should parse single KSS block in multiline comments', function() {
      var str = '' +
  '/* Comment\n' +
  'Styleguide 1.0\n' +
  '*/\n' +
  '\n' +
  '.a { b: c }',
      result = [
        {
          kss: '/* Comment\nStyleguide 1.0\n*/',
          code: '\n\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should parse multiline KSS with no ending linebreak', function() {
      var str = '' +
  '/* Comment\n' +
  'Styleguide 1.0    */' +
  '\n' +
  '.a { b: c }',
      result = [
        {
          kss: '/* Comment\nStyleguide 1.0    */',
          code: '\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });
    it('should parse multiline KSS with string prefixes', function() {
      var str = '' +
  '/* Comment\n' +
  ' * Styleguide 1.0\n' +
  '*/' +
  '\n' +
  '.a { b: c }',
      result = [
        {
          kss: '/* Comment\n * Styleguide 1.0\n*/',
          code: '\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should allow code blocks to have multiline comments', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment
//Styleguide 1.0

.a { b: c }
        */
      }) +
  '\n\n/* Simple comment */\n\n' +
  multiline(function() {
      /*
.x { y: z }
        */
      }),
      // jscs:enable
      result = [{
        kss: '// Comment\n//Styleguide 1.0',
        code: '\n\n.a { b: c }\n\n/* Simple comment */\n\n.x { y: z }'
      }],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should parse several KSS blocks with multiline comments', function() {
      var str = '/*\n' +
  'Comment1\n' +
  'Styleguide 1.0\n' +
  '*/\n' +
  '.a { b: c }\n' +
  '\n' +
  '/*\n' +
  'Comment2\n' +
  'Styleguide 2.0\n' +
  '*/',
      result = [
        {
          kss: '/*\nComment1\nStyleguide 1.0\n*/',
          code: '\n.a { b: c }\n\n'
        },
        {
          kss: '/*\nComment2\nStyleguide 2.0\n*/',
          code: ''
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });
  });

  describe('tricky CSS content', function() {

    it('should swallow content property with multiline comment', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
// Comment
// Styleguide 1.0

a:before { content: "/* ..." }

// Comment
// Styleguide 2

        */
      }),
      // jscs:enable
      result = [
        {
          kss: '// Comment\n// Styleguide 1.0',
          code: '\n\na:before { content: "/* ..." }\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 2\n',
          code: ''
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should swallow content property with singleline comment', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
a:before { content: "// Comment inside content" }

// Comment
// Styleguide 2
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '',
          code: 'a:before { content: "// Comment inside content" }\n\n'
        },
        {
          kss: '// Comment\n// Styleguide 2',
          code: ''
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should allow LESS with escaped function argument', function() {
      // jscs:disable
      var str = multiline(function() {
        /*
.a {
  .border(~"border linear .2s");
}
        */
      }),
      // jscs:enable
      result = [
        {
          kss: '',
          code: '.a {\n  .border(~"border linear .2s");\n}'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str, 'less');
      expect(kssBlocks).eql(result);
    });
  });
});
