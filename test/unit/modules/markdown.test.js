import { expect } from 'chai';
import markdown from '~/lib/modules/markdown';

describe('Markdown', () => {

  it('should add class .sg to <p> tags', () => {
    var result = markdown.render('foobar');
    expect(result).to.eql('<p class="sg">foobar</p>\n');
  });

  it('should add class .sg to <a> tags', () => {
    var result = markdown.render('[link text](linkHref)');
    expect(result).to.eql('<p class="sg"><a href="linkHref" class="sg">link text</a></p>\n');
  });

  it('should add class .sg to HTML <a> tags', () => {
    var result = markdown.render('<a href="linkHref">link text</a>');
    expect(result).to.eql('<p class="sg"><a href="linkHref" class="sg">link text</a></p>\n');
  });

  it('should not add class .sg when element has sg-no-style attribute', () => {
    var result = markdown.render('<a href="linkHref" sg-no-style="true">link text</a>');
    expect(result).to.eql('<p class="sg"><a href="linkHref" sg-no-style="true">link text</a></p>\n');
  });

  it('should add dasherized name attribute to headers', () => {
    var result = markdown.render('# This is heading');
    expect(result).to.eql('<h1 class="sg" name="this-is-heading">This is heading</h1>\n');
  });

  it('should exclude links to https://travis-ci.org/SC5/sc5-styleguide', () => {
    var result = markdown.render('[link text](https://travis-ci.org/SC5/sc5-styleguide)');
    expect(result).to.eql('<p class="sg"></p>\n');
  });

  it('should exclude links to https://david-dm.org/SC5/sc5-styleguide', () => {
    var result = markdown.render('[link text](https://david-dm.org/SC5/sc5-styleguide)');
    expect(result).to.eql('<p class="sg"></p>\n');
  });

  it('should add scroll directive to the anchored links', () => {
    var result = markdown.render('[link text](#anchor)');
    expect(result).to.eql('<p class="sg"><a href="#anchor" class="sg" du-smooth-scroll="yes">link text</a></p>\n');
  });

  it('should return empty string with undefined input', () => {
    var result = markdown.render();
    expect(result).to.eql('');
  });

  it('getStream returns an object', () => {
    var overview = markdown.getStream('./test/data/overview.md');
    expect(overview).to.be.an('object');
  });

  it('should fence code blocks for angular-highlightjs', () => {
    var result = markdown.render('```\nvar highlight = true;\n```');
    expect(result).to.eql('<div hljs="">var highlight = true;\n</div>\n');
  });

  it('should fence code blocks for angular-highlightjs with provided language', () => {
    var result = markdown.render('```javascript\nvar highlight = true;\n```');
    expect(result).to.eql('<div hljs="" hljs-language="javascript">var highlight = true;\n</div>\n');
  });
});
