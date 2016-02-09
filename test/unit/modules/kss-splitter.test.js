//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
import { expect } from 'chai';
import kssSplitter from '~/lib/modules/kss-splitter';

describe('KSS splitter', () => {

  describe('Splitter module', () => {
    it('Split 2 blocks of singleline comments', () => {
      // jscs:disable
      var str = `// Comment1
// Comment1

// Comment2
// Comment2`,
        // jscs:enable
        result = [
          {type: 'comment', content: '// Comment1\n// Comment1', position: { line: 1, column: 1 } },
          { type: 'code', content: '\n\n', position: { line: 2, column: 12 } },
          { type: 'comment', content: '// Comment2\n// Comment2', position: { line: 4, column: 1 } }
        ],
      split = kssSplitter.pureSplitter(str);

      expect(split).eql(result);
      //expect(split).eql(null);

    });
  });

  describe('Singleline comment declarations', () => {
    it('should parse single KSS block', () => {
      // jscs:disable
      var str = `// Comment
// Styleguide 1.0

.a { b: c }`,
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

    it('should be agnostic to spaces in reference declaration', () => {
      var str = `// Comment
//Styleguide 1.0

.a { b: c }`,
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

    it('should take multiline code', () => {
      // jscs:disable
      var str = `// Comment
//Styleguide 1.0

.a { b: c }
$a: b;

.x { y: z }`,
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

    it('should allow code blocks to have not KSS comments', () => {
      // jscs:disable
      var str = `// Comment
//Styleguide 1.0

.a { b: c }

// Simple comment

.x { y: z }`,
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

    it('should parse several blocks', () => {
      // jscs:disable
      var str = `// Comment1
// Styleguide 1.0

.a { b: c }

// Comment2
// Styleguide 2.0

.x { y: z }`,
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

    it('should parse several blocks 2', () => {
      // jscs:disable
      var str = `@import "test";
// Comment
// Styleguide 1.0

.a { b: c }

// Comment
// Styleguide 2

// Comment
// Styleguide 2.0


.a { b: c }
`,
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

    it('should allow blocks with no code', () => {
      // jscs:disable
      var str = `// Comment1
// Styleguide 1.0

.a { b: c }

// Comment2
// Styleguide 2.0

// Comment3
// Styleguide 3.0

.x { y: z }`,
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

    it('should take any reference number', () => {
      // jscs:disable
      var str = `// Comment
// Styleguide 1

.a { b: c }

// Comment
// Styleguide 1.1

// Comment
// Styleguide 5.1.2.6`,
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

    it('should take code before first KSS block', () => {
      // jscs:disable
      var str = `.x { y: x }

// Comment
// Styleguide 1.0

.a { b: c }`,
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

  describe('Multiline comment declarations', () => {

    it('should parse single KSS block in multiline comments', () => {
      var str = `/* Comment
Styleguide 1.0
*/

.a { b: c }`,
      result = [
        {
          kss: `/* Comment
Styleguide 1.0
*/`,
          code: `

.a { b: c }`
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should parse multiline KSS with no ending linebreak', () => {
      var str = `/* Comment
Styleguide 1.0    */
.a { b: c }`,
      result = [
        {
          kss: `/* Comment
Styleguide 1.0    */`,
          code: `
.a { b: c }`
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });
    it('should parse multiline KSS with string prefixes', () => {
      var str = `/* Comment
 * Styleguide 1.0
*/
.a { b: c }`,
      result = [
        {
          kss: `/* Comment
 * Styleguide 1.0
*/`,
          code: '\n.a { b: c }'
        }
      ],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should allow code blocks to have multiline comments', () => {
      // jscs:disable
      var str = `// Comment
//Styleguide 1.0

.a { b: c }

/* Simple comment */

.x { y: z }`,
      // jscs:enable
      result = [{
        kss: '// Comment\n//Styleguide 1.0',
        code: '\n\n.a { b: c }\n\n/* Simple comment */\n\n.x { y: z }'
      }],
      kssBlocks = kssSplitter.getBlocks(str);
      expect(kssBlocks).eql(result);
    });

    it('should parse several KSS blocks with multiline comments', () => {
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

  describe('tricky CSS content', () => {

    it('should swallow content property with multiline comment', () => {
      // jscs:disable
      var str = `// Comment
// Styleguide 1.0

a:before { content: "/* ..." }

// Comment
// Styleguide 2
`,
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

    it('should swallow content property with singleline comment', () => {
      // jscs:disable
      var str = `a:before { content: "// Comment inside content" }

// Comment
// Styleguide 2`,
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

    it('should allow LESS with escaped function argument', () => {
      // jscs:disable
      var str = `.a {
  .border(~"border linear .2s");
}`,
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

    it('should split rich PostCSS', () => {
        var str = `/* Comment

Styleguide 1 */ .test {
    &::before {
        content: 'Should work';
    }
}`,
      result = [
          { kss: '/* Comment\n\nStyleguide 1 */',
          code: '.test {\n    &::before {\n        content: \'Should work\';\n    }\n}' }
      ],
      kssBlocks = kssSplitter.getBlocks(str, 'css', 'postcss');
      expect(kssBlocks).eql(result);
    });
  });
});
