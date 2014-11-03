var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  parseKSS = require('../lib/modules/kss').parseKSS;

describe('KSS parser', function() {

  var json = {};

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

  it('Wrapper should exist', function() {
    expect(json.sections[1].wrappedMarkup).to.be.a('string');
  });

  it('Wrapper should contact wrapper markup', function() {
    var wrappedMarkup = '\n<nav class="sg side-nav">\n <ul>\n   <li>\n   <a class="{$modifiers}">Item</a>\n </li>\n\n </ul>\n</nav>\n';
    expect(json.sections[1].wrappedMarkup).eql(wrappedMarkup);
  });

  it('Wrapper is defined for modifiers', function() {
    expect(json.sections[1].modifiers[0].wrappedMarkup).to.be.a('string');
  });

  it('Wrapper for a modifier should contact wrapper markup', function() {
    var wrappedMarkup = '\n<nav class="sg side-nav">\n <ul>\n   <li>\n   <a class="default">Item</a>\n </li>\n\n </ul>\n</nav>\n';
    expect(json.sections[1].modifiers[0].wrappedMarkup).eql(wrappedMarkup);
  });

  it('Wrapper should be inheritable', function() {
    expect(json.sections[2].wrappedMarkup).eql('\n<div class="parent-wrapper">\n<div class="parent"></div>\n\n</div>\n');
    expect(json.sections[3].wrappedMarkup).eql('\n<div class="parent-wrapper">\n\n<div class="child-wrapper">\n<div class="child"></div>\n\n</div>\n\n</div>\n');
  });

});
