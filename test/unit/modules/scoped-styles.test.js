'use strict';

var requireModule = require('requirefrom')('lib/modules'),
  chai = require('chai'),
  expect = chai.expect,
  scopedStyles = requireModule('scoped-styles');

describe('module scoped-styles', function() {

  var style = 'p { top: 0; }';
  function getStyles() {
    return scopedStyles.stylesFromString(style);
  }

  it('returns a promise', function() {
    var p = getStyles();
    expect(p.then).to.be.a('function');
    expect(p.catch).to.be.a('function');
  });

  describe('the returned promise', function() {

    it('is resolved with the string prepended with ::content', function(done) {
      getStyles().then(function(css) {
        expect(clean(css)).to.eql('::content p { top: 0; }');
        done();
      }).catch(done);
    });

    it('is resolved with the string less variables expanded and removed', function(done) {
      style = '@val: 0; p { top: @val; }';
      getStyles().then(function(css) {
        expect(clean(css)).to.eql('::content p { top: 0; }');
        done();
      }).catch(done);
    });

    it('is rejected when less parsing fails', function(done) {
      style = '$foo = bar;';
      getStyles().done(function() {
        done(new Error('expected promise to be rejected'));
      }, function(err) {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.be.a('string');
        done();
      });
    });

  });

  function clean(str) {
    return str.replace(/\n/ig, ' ').replace(/\s+/ig, ' ').trim();
  }

});
