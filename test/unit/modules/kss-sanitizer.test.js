//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    kssSanitizer = requireModule('kss-sanitize-params');

describe('KSS sanitizer', function() {
  describe('Single line comments', function() {
    it('should sanitize sg-prefixed parameter', function() {
      // jscs:disable
      var str = `// Test
//
// sg-angular:
//
// Test`,
        result = `// Test
//
//
// Test`,
        sanitized = kssSanitizer(str);
      // jscs:enable
      expect(sanitized).eql(result);

    });

    it('should sanitize not sanitize other parameters', function() {
      // jscs:disable
      var str = `// Test
//
// markup:
//
// Test`,
        result = `// Test
//
// markup:
//
// Test`,
        sanitized = kssSanitizer(str);
      // jscs:enable
      expect(sanitized).eql(result);

    });

    it('should sanitize not sanitize the whole paragraph', function() {
      // jscs:disable
      var str = `// Test
//
// sg-wrapper:
// <div>
//  <span></span>
// </div>
//
// Test`,
        result = `// Test
//
//
// Test`,
        sanitized = kssSanitizer(str);
      // jscs:enable
      expect(sanitized).eql(result);

    });

    it('should allow spaces in empty strings', function() {
      // jscs:disable
      var str = `// Test
//
// sg-param:
// Test
//
// Test`,
        result = `// Test
//
//
// Test`,
        sanitized = kssSanitizer(str);
      // jscs:enable
      expect(sanitized).eql(result);
    });
  });
  describe('Multi line comments', function() {

    it('should sanitize sg-prefixed parameter', function() {
      // jscs:disable
      var str = `/*
Test

sg-angular:

Test
*/`,
        result = `/*
Test


Test
*/`,
        // jscs:enable
        sanitized = kssSanitizer(str);

      expect(sanitized).eql(result);

    });
  });

});
