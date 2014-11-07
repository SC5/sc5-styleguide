var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  multiline = require('multiline'),
  kssSplitter = require('../lib/modules/kss-splitter');

describe('KSS divider', function() {

  it('should parse single KSS block', function() {
    var str = multiline(function() {
      /*
// Comment
// Styleguide 1.0

.a { b: c }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n// Styleguide 1.0\n'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
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
      [
        'block',
        [
          'kss',
          '// Comment\n//Styleguide 1.0 \n'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
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
      [
        'block',
        [
          'kss',
          '// Comment\n//Styleguide 1.0 \n'
        ],
        [
          'code',
          '.a { b: c }\n$a: b;\n\n.x { y: z }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

});
