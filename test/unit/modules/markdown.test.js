var requireModule = require('requirefrom')('lib/modules'),
    expect = require('chai').expect,
    markdown = requireModule('markdown');

describe('Markdown', function() {

  describe('renderer', function() {

    var renderer, result;

    beforeEach(function() {
      renderer = markdown.getRenderer();
      renderer.options = {
        sanitize: true
      };
    });

    describe('link', function() {

      it('adds class .sg to <a> tags', function() {
        result = renderer.link('linkHref', 'title', 'link text');
        expect(result).to.eql('<a class="sg" href="linkHref" title="title">link text</a>');
      });

      it('excludes link to https://travis-ci.org/SC5/sc5-styleguide', function() {
        result = renderer.link('https://travis-ci.org/SC5/sc5-styleguide');
        expect(result).to.eql('');
      });

      it('excludes link to https://david-dm.org/SC5/sc5-styleguide', function() {
        result = renderer.link('https://david-dm.org/SC5/sc5-styleguide');
        expect(result).to.eql('');
      });

    });

  });

  it('getRenderer if formed correctly', function() {
    var renderer = markdown.getRenderer();
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
