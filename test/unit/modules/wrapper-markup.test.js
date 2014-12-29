var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    wrapperMarkup = requireModule('wrapper-markup');

describe('KSS wrapper markup generator', function() {

  var json = {},
    removeLinebreaks = function(text) {
      return text.replace(/(\r\n|\n|\r)/gm, '');
    };

  beforeEach(function() {
    var section = [];
    section[0] = {},
    section[0].markup = multiline(function() {
/*
<container></container>
*/
    }),
    section[1] = {},
    section[1].markup = multiline(function() {
/*
<p>Content inside outer wrapper</p>
*/
    }),
    section[1]['sg-wrapper'] = multiline(function() {
/*
<outer-wrapper>
<sg-wrapper-content/>
</outer-wrapper>
*/
    }),
    section[2] = {},
    section[2].markup = multiline(function() {
/*
<p>Content inside outer wrapper</p>
*/
    }),
    section[3] = {},
    section[3].markup = multiline(function() {
/*
<p>Content inside inner and outer wrapper</p>
*/
    }),
    section[3]['sg-wrapper'] = multiline(function() {
/*
<inner-wrapper>
<sg-wrapper-content/>
</inner-wrapper>
*/
    }),
    section[4] = {},
    section[4].markup = multiline(function() {
/*
<p>Second level content</p>
*/
    }),
    section[5] = {},
    section[5].markup = multiline(function() {
/*
<button></button>
*/
    }),
    section[5]['sg-wrapper'] = multiline(function() {
/*
<wrapper>
<sg-wrapper-content/>
</wrapper>
*/
    });

    json = {
      sections: [{
        header: 'Main section',
        description: '',
        reference: '1.0',
        modifiers: [],
        markup: section[0].markup
      }, {
        header: 'Define outer wrapper',
        description: '',
        reference: '1.1',
        modifiers: [],
        markup: section[1].markup,
        'sg-wrapper': section[1]['sg-wrapper']
      }, {
        header: 'Content inside outer wrapper',
        description: '',
        reference: '1.1.1',
        modifiers: [],
        markup: section[2].markup
      }, {
        header: 'Content inside inner and outer wrapper',
        description: '',
        reference: '1.1.2',
        modifiers: [],
        markup: section[3].markup,
        'sg-wrapper': section[3]['sg-wrapper']
      }, {
        header: 'Multiple inherited wrapper',
        description: '',
        reference: '1.1.2.1',
        modifiers: [],
        markup: section[4].markup
      }, {
        header: 'Button',
        description: '',
        reference: '2',
        modifiers: [
            {
              id: 1,
              name: 'modifier',
              description: '',
              markup: '<button class="modifier"></button>'
            }
          ],
        markup: section[5].markup,
        'sg-wrapper': section[5]['sg-wrapper']
      }]
    };
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

  it('should work for modifiers', function() {
    var wrappedMarkup = '<wrapper><button class="modifier"></button></wrapper>';
    expect(removeLinebreaks(json.sections[5].modifiers[0].wrappedMarkup)).eql(wrappedMarkup);
  });

});
