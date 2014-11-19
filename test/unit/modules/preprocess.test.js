'use strict';

var requireModule = require('requirefrom')('lib/modules'),
    expect = require('chai').expect,
    preprocessor = requireModule('preprocess');

describe('preprocessor', function() {

  describe('.getStream()', function() {

    it('is a function', function() {
      expect(preprocessor.getStream).to.be.an('function');
    });

  });

});
