var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  multiline = require('multiline'),
  kssSplitter = require('../lib/modules/kss-splitter');

describe('KSS splitter', function() {

  it('Split 2 blocks of comments', function(){
    var str = multiline(function() {
      /*
// Comment1
// Comment1

// Comment2
// Comment2
      */
    }),
      result = [
      { type: 'comment', content: '// Comment1\n// Comment1' },
      { type: 'code', content: '' },
      { type: 'comment', content: '// Comment2\n// Comment2' }
    ],
      split = kssSplitter.pureSplitter(str);

    expect(split).eql(result);

  });

  it('should parse single KSS block', function() {
    var str = multiline(function() {
      /*
// Comment
// Styleguide 1.0

.a { b: c }
      */
    }),
    result = [
      {
        'kss': '// Comment\n// Styleguide 1.0',
        'code': '\n\n.a { b: c }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should be agnostic to spaces in reference declaration', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }
      */
    }),
    result = [
      {
        'kss': '// Comment\n//Styleguide 1.0 ',
        'code': '\n\n.a { b: c }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should take multiline code', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }
$a: b;

.x { y: z }
      */
    }),
    result = [
      {
        'kss': '// Comment\n//Styleguide 1.0 ',
        'code': '\n\n.a { b: c }\n$a: b;\n\n.x { y: z }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should allow code blocks to have comments', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }

// Simple comment

.x { y: z }
      */
    }),
    result = [
      {
        'kss': '// Comment\n//Styleguide 1.0 ',
        'code': '\n\n.a { b: c }\n\n// Simple comment\n\n.x { y: z }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should parse several blocks', function(){
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
    result = [
      {
        'kss': '// Comment1\n// Styleguide 1.0',
        'code': '\n\n.a { b: c }\n'
      },
      {
        'kss': '// Comment2\n// Styleguide 2.0',
        'code': '\n\n.x { y: z }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should allow blocks with no code', function(){
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
    result = [
      {
        'kss': '// Comment1\n// Styleguide 1.0',
        'code': '\n\n.a { b: c }\n'
      },
      {
        'kss': '// Comment2\n// Styleguide 2.0',
        'code': '\n'
      },
      {
        'kss': '// Comment3\n// Styleguide 3.0',
        'code': '\n\n.x { y: z }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should take any reference number', function(){
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
    result = [
      {
        'kss': '// Comment\n// Styleguide 1',
        'code': '\n\n.a { b: c }\n'
      },
      {
        'kss': '// Comment\n// Styleguide 1.1',
        'code': '\n'
      },
      {
        'kss': '// Comment\n// Styleguide 5.1.2.6',
        'code': ''
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should take code before first KSS block', function() {
    var str = multiline(function() {
      /*
.x { y: x }

// Comment
// Styleguide 1.0

.a { b: c }
      */
    }),
    result = [
      {
        kss: '',
        code: '\n.x { y: x }\n'
      },
      {
        'kss': '// Comment\n// Styleguide 1.0',
        'code': '\n\n.a { b: c }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should parse single KSS block in multiline comments', function() {
    var str = '' +
'/* Comment\n' +
'Styleguide 1.0\n' +
'*/\n' +
'\n' +
'.a { b: c }',
    result = [
      {
        'kss': '/* Comment\nStyleguide 1.0\n*/',
        'code': '\n\n.a { b: c }'
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
        'kss': '/* Comment\nStyleguide 1.0    */',
        'code': '\n.a { b: c }'
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
        'kss': '/* Comment\n * Styleguide 1.0\n*/',
        'code': '\n.a { b: c }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should allow code blocks to have multiline comments', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }
      */}) +
'\n\n/* Simple comment */\n\n' +
multiline(function() {
    /*
.x { y: z }
      */
    }),
    result = [
      {
        'kss': '// Comment\n//Styleguide 1.0 ',
        'code': '\n\n.a { b: c }\n\n/* Simple comment */\n\n.x { y: z }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  it('should parse several KSS blocks with multiline comments', function(){
    var str = '/*\n' +
'Comment1\n' +
'Styleguide 1.0\n' +
'*/\n' +
'.a { b: c }\n' +
'\n' +
'/*\n' +
'Comment2\n' +
'Styleguide 2.0\n' +
'*/'
    '',
    result = [
      {
        'kss': '/*\nComment1\nStyleguide 1.0\n*/',
        'code': '\n.a { b: c }\n'
      },
      {
        'kss': '/*\nComment2\nStyleguide 2.0\n*/',
        'code': ''
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

  /* TODO: Parser does not work with code after 2nd code block */

  it('should return array of blocks', function() {
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
    result = [
      {
        kss: '',
        code: '\n@import "test";'
      },
      {
        kss: '// Comment\n// Styleguide 1.0',
        code: '\n\n.a { b: c }\n'
      },
      {
        kss: '// Comment\n// Styleguide 2',
        code: '\n'
      },
      {
        kss: '// Comment\n// Styleguide 2.0',
        code: '\n\n\n.a { b: c }'
      }
    ],
    kssBlocks = kssSplitter.getBlocks(str);
    expect(kssBlocks).eql(result);
  });

});
