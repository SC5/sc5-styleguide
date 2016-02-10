import { expect } from 'chai';
import wrapperMarkup from '~/lib/modules/wrapper-markup';

describe('KSS wrapper markup generator', () => {

  var json = {},
    removeLinebreaks = (text) => {
      return text.replace(/(\r\n|\n|\r)/gm, '');
    };

  beforeEach(() => {
    var section = [];
    section[0] = {},
    section[0].markup = `<container></container>`,
    section[1] = {},
    section[1].markup = `<p>Content inside outer wrapper</p>`,
    section[1]['sg-wrapper'] = `<outer-wrapper>
<sg-wrapper-content/>
</outer-wrapper>`,
    section[2] = {},
    section[2].markup = `<p>Content inside outer wrapper</p>`,
    section[3] = {},
    section[3].markup = `<p>Content inside inner and outer wrapper</p>`,
    section[3]['sg-wrapper'] = `<inner-wrapper>
<sg-wrapper-content/>
</inner-wrapper>`,
    section[4] = {},
    section[4].markup = `<p>Second level content</p>`,
    section[5] = {},
    section[5].markup = `<button></button>`,
    section[5]['sg-wrapper'] = `<wrapper>
<sg-wrapper-content/>
</wrapper>`;
    section[6] = {};
    section[6].markup = `<span>Hello, world</span>`;
    section[6]['sg-wrapper'] = `<wrapper1>
  <sg-wrapper-content/>
</wrapper1>
<wrapper2>
  <sg-wrapper-content/>
</wrapper2>
`;

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
      }, {
        header: 'Siblings wrappers',
        description: '',
        reference: '3',
        modifiers: [],
        markup: section[6].markup,
        'sg-wrapper': section[6]['sg-wrapper']
      }]
    };
    json.sections = wrapperMarkup.generateSectionWrapperMarkup(json.sections);
  });

  it('should not add wrapper to the parent sections', () => {
    var wrappedMarkup = '<container></container>';
    expect(removeLinebreaks(json.sections[0].renderMarkup)).eql(wrappedMarkup);
  });

  it('should add wrapper markup to the current section', () => {
    var wrappedMarkup = '<outer-wrapper><p>Content inside outer wrapper</p></outer-wrapper>';
    expect(removeLinebreaks(json.sections[1].renderMarkup)).eql(wrappedMarkup);
  });

  it('should inherit wrapper markup to the subsection', () => {
    var wrappedMarkup = '<outer-wrapper><p>Content inside outer wrapper</p></outer-wrapper>';
    expect(removeLinebreaks(json.sections[2].renderMarkup)).eql(wrappedMarkup);
  });

  it('should inherit wrapper markup to the subsection with the current wrapper markup', () => {
    var wrappedMarkup = '<outer-wrapper><inner-wrapper><p>Content inside inner and outer wrapper</p></inner-wrapper></outer-wrapper>';
    expect(removeLinebreaks(json.sections[3].renderMarkup)).eql(wrappedMarkup);
  });

  it('should inherit all parent wrapper markups to the sub-sub-section', () => {
    var wrappedMarkup = '<outer-wrapper><inner-wrapper><p>Second level content</p></inner-wrapper></outer-wrapper>';
    expect(removeLinebreaks(json.sections[4].renderMarkup)).eql(wrappedMarkup);
  });

  it('should work for modifiers', () => {
    var wrappedMarkup = '<wrapper><button class="modifier"></button></wrapper>';
    expect(removeLinebreaks(json.sections[5].modifiers[0].renderMarkup)).eql(wrappedMarkup);
  });

  it('should work with siblings wrappers', () => {
    var wrappedMarkup = '<wrapper1>  <span>Hello, world</span></wrapper1><wrapper2>  <span>Hello, world</span></wrapper2>';
    expect(removeLinebreaks(json.sections[6].renderMarkup)).eql(wrappedMarkup);
  });

});
