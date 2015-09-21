var requireModule = require('requirefrom')('lib/modules'),
    expect = require('chai').expect,
    markdown = requireModule('markdown');

describe('Markdown', function() {

  it('should add class .sg to <p> tags', function() {
    var result = markdown.render('foobar');
    expect(result).to.eql('<p class="sg">foobar</p>\n');
  });

  it('should add class .sg to <a> tags', function() {
    var result = markdown.render('[link text](linkHref)');
    expect(result).to.eql('<p class="sg"><a href="linkHref" class="sg">link text</a></p>\n');
  });

  it('should add class .sg to HTML <a> tags', function() {
    var result = markdown.render('<a href="linkHref">link text</a>');
    expect(result).to.eql('<p class="sg"><a href="linkHref" class="sg">link text</a></p>\n');
  });

  it('should not add class .sg when element has sg-no-style attribute', function() {
    var result = markdown.render('<a href="linkHref" sg-no-style="true">link text</a>');
    expect(result).to.eql('<p class="sg"><a href="linkHref" sg-no-style="true">link text</a></p>\n');
  });

  it('should add dasherized name attribute to headers', function() {
    var result = markdown.render('# This is heading');
    expect(result).to.eql('<h1 class="sg" name="this-is-heading">This is heading</h1>\n');
  });

  it('should exclude links to https://travis-ci.org/SC5/sc5-styleguide', function() {
    var result = markdown.render('[link text](https://travis-ci.org/SC5/sc5-styleguide)');
    expect(result).to.eql('<p class="sg"></p>\n');
  });

  it('should exclude links to https://david-dm.org/SC5/sc5-styleguide', function() {
    var result = markdown.render('[link text](https://david-dm.org/SC5/sc5-styleguide)');
    expect(result).to.eql('<p class="sg"></p>\n');
  });

  it('should add scroll directive to the anchored links', function() {
    var result = markdown.render('[link text](#anchor)');
    expect(result).to.eql('<p class="sg"><a href="#anchor" class="sg" du-smooth-scroll="yes">link text</a></p>\n');
  });

  it('should return empty string with undefined input', function() {
    var result = markdown.render();
    expect(result).to.eql('');
  });

  it('getStream returns an object', function() {
    var overview = markdown.getStream('./data/overview.md');
    expect(overview).to.be.an('object');
  });
});
