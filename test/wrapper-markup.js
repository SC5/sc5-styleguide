var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  multiline = require('multiline'),
  wrapperMarkup = require('../lib/modules/wrapper-markup');

describe('KSS wrapper markup generator', function() {

  var json = {},
    removeLinebreaks = function(text) {
      return text.replace(/(\r\n|\n|\r)/gm, '');
    }

  beforeEach(function() {
    var markup = [];
    markup[0] = multiline(function() {
/*
<container></container>
*/
    }),
    markup[1] = multiline(function() {
/*
<p>Content inside outer wrapper</p>
<sg:wrapper>
<outer-wrapper>
<sg:wrapper-content/>
</outer-wrapper>
</sg:wrapper>
*/
    }),
    markup[2] = multiline(function() {
/*
<p>Content inside outer wrapper</p>
*/
    }),
    markup[3] = multiline(function() {
/*
<p>Content inside inner and outer wrapper</p>
<sg:wrapper>
<inner-wrapper>
<sg:wrapper-content/>
</inner-wrapper>
</sg:wrapper>
*/
    }),
    markup[4] = multiline(function() {
/*
<p>Second level content</p>
*/
    });

    json = {
      sections: [{
        header: 'Main section',
        description: '',
        reference: '1.0',
        modifiers: [],
        markup: markup[0]
      }, {
        header: 'Define outer wrapper',
        description: '',
        reference: '1.1',
        modifiers: [],
        markup: markup[1]
      }, {
        header: 'Content inside outer wrapper',
        description: '',
        reference: '1.1.1',
        modifiers: [],
        markup: markup[2]
      }, {
        header: 'Content inside inner and outer wrapper',
        description: '',
        reference: '1.1.2',
        modifiers: [],
        markup: markup[3]
      }, {
        header: 'Multiple inherited wrapper',
        description: '',
        reference: '1.1.2.1',
        modifiers: [],
        markup: markup[4]
      }]
    }
    json.sections = wrapperMarkup.generateSectionWrapperMarkup(json.sections);
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
