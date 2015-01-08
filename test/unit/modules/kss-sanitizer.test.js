//jscs:disable disallowTrailingWhitespace
//jscs:disable disallowMultipleLineBreaks
var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    kssSanitizer = requireModule('kss-sanitize-params');

describe('KSS sanitizer', function() {

  describe('Single line comments', function() {
    it('Split 2 blocks of singleline comments', function() {
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
  });

});
