//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    kssSanitizer = requireModule('kss-sanitize-params');

describe('KSS sanitizer', function() {

  describe('Single line comments', function() {

    it('should sanitize sg-prefixed parameter', function() {
      var str = multiline(function() {
        /*
// Test
//
// sg-angular:
//
// Test
        */
        }),
        result = multiline(function() {
        /*
// Test
//
//
// Test
        */
        }),
        sanitized = kssSanitizer(str);

      expect(sanitized).eql(result);

    });

    it('should sanitize not sanitize other parameters', function() {
      var str = multiline(function() {
        /*
// Test
//
// markup:
//
// Test
        */
        }),
        result = multiline(function() {
        /*
// Test
//
// markup:
//
// Test
        */
        }),
        sanitized = kssSanitizer(str);

      expect(sanitized).eql(result);

    });

    it('should sanitize not sanitize the whole paragraph', function() {
      var str = multiline(function() {
        /*
// Test
//
// sg-wrapper:
// <div>
//  <span></span>
// </div>
//
// Test
        */
        }),
        result = multiline(function() {
        /*
// Test
//
//
// Test
        */
        }),
        sanitized = kssSanitizer(str);

      expect(sanitized).eql(result);

    });

    it('should allow spaces in empty strings', function() {
      var str = multiline(function() {
        /*
// Test
// 
// sg-param:
// Test
// 
// Test
        */
        }),
        result = multiline(function() {
        /*
// Test
// 
// 
// Test
        */
        }),
        sanitized = kssSanitizer(str);

      expect(sanitized).eql(result);

    });

  });
  describe('Multi line comments', function() {

    it('should sanitize sg-prefixed parameter', function() {
      var str = '/*\n' + multiline(function() {
        /*
Test

sg-angular:

Test
        */
        }) + '\n*/',
        result = '/*\n' + multiline(function() {
        /*
Test


Test
        */
        }) + '\n*/',
        sanitized = kssSanitizer(str);

      expect(sanitized).eql(result);

    });
  });

});
