var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  multiline = require('multiline'),
  markdown = require('../lib/modules/markdown');

describe('Markdown', function() {

  it('getRenderer if formed correctly', function() {
    var renderer = markdown.getRenderer();
    console.log(renderer);
    expect(renderer).to.be.an('object');
    expect(renderer.heading).to.be.an('function');
    expect(renderer.paragraph).to.be.an('function');
    expect(renderer.link).to.be.an('function');
    expect(renderer.code).to.be.an('function');
  });

  it('getStream returns an object', function() {
    var overview = markdown.getStream('./data/overview.md');
    expect(overview).to.be.an('object');
  });

});
