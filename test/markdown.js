var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  multiline = require('multiline'),
  markdown = require('../lib/modules/markdown');

describe('Markdown', function() {

  it('getStream returns an object', function() {
    var overview = markdown.getStream('./data/overview.md');
    expect(overview).to.be.an('object');
  });

});
