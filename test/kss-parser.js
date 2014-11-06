var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  parseKSS = require('../lib/modules/kss').parseKSS;

describe('KSS parser', function() {

  var json = {},
    removeLinebreaks = function(text) {
      return text.replace(/(\r\n|\n|\r)/gm, '');
    }

  before(function(done) {
    filesBuffer = {
      './test/data/wrapper.scss': fs.readFileSync('./test/data/wrapper.scss', 'utf-8')
    };
    parseKSS(
      filesBuffer,
      { markdown: true, multiline: true, typos: false },
      function(data) {
        json = data;
        done();
      }
    );
  });

  it('should not add wrapper to the parent sections', function() {
    var wrappedMarkup = '<container></container>';
    expect(removeLinebreaks(json.sections[0].wrappedMarkup)).eql(wrappedMarkup);
  });

  it('should add wrapper markup to the current section', function() {
    var wrappedMarkup = '<outer-wrapper><p>Content inside outer wrapper</p></outer-wrapper>';
    expect(removeLinebreaks(json.sections[1].wrappedMarkup)).eql(wrappedMarkup);
  });

  it('should inherit wrapper markup to the subsection', function() {
    var wrappedMarkup = '<outer-wrapper><p>Content inside outer wrapper</p></outer-wrapper>';
    expect(removeLinebreaks(json.sections[2].wrappedMarkup)).eql(wrappedMarkup);
  });

  it('should inherit wrapper markup to the subsection with the current wrapper markup', function() {
    var wrappedMarkup = '<outer-wrapper><inner-wrapper><p>Content inside inner and outer wrapper</p></inner-wrapper></outer-wrapper>';
    expect(removeLinebreaks(json.sections[3].wrappedMarkup)).eql(wrappedMarkup);
  });

  it('should inherit all parent wrapper markups to the sub-sub-section', function() {
    var wrappedMarkup = '<outer-wrapper><inner-wrapper><p>Second level content</p></inner-wrapper></outer-wrapper>';
    expect(removeLinebreaks(json.sections[4].wrappedMarkup)).eql(wrappedMarkup);
  });
});
