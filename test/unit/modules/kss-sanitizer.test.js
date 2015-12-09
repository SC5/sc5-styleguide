//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
import { expect } from 'chai';
import kssSanitizer from '~/lib/modules/kss-sanitize-params';

describe('KSS sanitizer', () => {
  describe('Single line comments', () => {
    it('should sanitize sg-prefixed parameter', () => {
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

    it('should sanitize not sanitize other parameters', () => {
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

    it('should sanitize not sanitize the whole paragraph', () => {
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

    it('should allow spaces in empty strings', () => {
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
  describe('Multi line comments', () => {

    it('should sanitize sg-prefixed parameter', () => {
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
