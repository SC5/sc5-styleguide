var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    replaceSectionReferences = requireModule('section-references').replace;

describe('Processing section references in the markup', function() {

  var json = {},
    removeLinebreaks = function(text) {
      return text.replace(/(\r\n|\n|\r)/gm, '');
    };

  beforeEach(function() {
    var section = [];
    section[0] = {},
    section[0].markup = `<div>1.0</div>`,
    section[1] = {},
    section[1].markup = `<sg-insert>1.0</sg-insert>`,
    section[2] = {},
    section[2].markup = `<div>2.1</div>`,
    section[3] = {},
    section[3].markup = `<sg-insert>1.0</sg-insert>
<sg-insert>2.1</sg-insert>`,
    section[4] = {},
    section[4].markup = `<div class="nice">
  <sg-insert>1.0</sg-insert>
</div>`,
    section[5] = {},
    section[5].markup = `<div class="even-better">
  <sg-insert>3.1</sg-insert>
</div>`,
    section[6] = {},
    section[6].markup = `<div style="background:{$modifiers};">{$modifiers}</div>`,
    section[7] = {},
    section[7].markup = `<sg-insert>4.1-1</sg-insert>
<sg-insert>4.1-10</sg-insert>`,
    section[8] = {},
    section[8].markup = `<sg-insert>4.1-all</sg-insert>`;

    json = {
      sections: [{
        header: 'Just a section',
        description: '',
        reference: '1.0',
        modifiers: [],
        markup: section[0].markup
      }, {
        header: 'Section with inserted section',
        description: '',
        reference: '1.1',
        modifiers: [],
        markup: section[1].markup
      }, {
        header: 'Another just a section',
        description: '',
        reference: '2.1',
        modifiers: [],
        markup: section[2].markup
      }, {
        header: 'Section with 2 inserted sections',
        description: '',
        reference: '2.2',
        modifiers: [],
        markup: section[3].markup
      }, {
        header: 'Section with an inserted section',
        description: '',
        reference: '3.1',
        modifiers: [],
        markup: section[4].markup
      }, {
        header: 'Nested insert',
        description: '',
        reference: '3.2',
        modifiers: [],
        markup: section[5].markup
      }, {
        header: 'Section with modifier',
        description: '',
        reference: '4.1',
        modifiers: [{
            className: 'modifier1',
            markup: section[6].markup
        }, {
            className: 'modifier2',
            markup: section[6].markup
        }],
        markup: section[6].markup
      }, {
          header: 'Section with inserted sections with one invalid and one valid modifier',
          description: '',
          reference: '4.2',
          modifiers: [],
          markup: section[7].markup
      }, {
          header: 'Section with inserted section with all modifiers',
          description: '',
          reference: '4.3',
          modifiers: [],
          markup: section[8].markup
      }]
    };
    json.sections = replaceSectionReferences(json.sections);
  });

  it('should replace section reference', function() {
    var replacedRefs = '<div>1.0</div>';
    expect(removeLinebreaks(json.sections[1].markup)).eql(replacedRefs);
  });

  it('should replace several sections', function() {
    var replacedRefs = '<div>1.0</div><div>2.1</div>';
    expect(removeLinebreaks(json.sections[3].markup)).eql(replacedRefs);
  });

  it('should process nested replacements', function() {
    var replacedRefs = '<div class="even-better">  <div class="nice">  <div>1.0</div></div></div>';
    expect(removeLinebreaks(json.sections[5].markup)).eql(replacedRefs);
  });

  it('should replace modifier references when valid', function() {
    var replacedRefs = '<div style="background:modifier1;">modifier1</div><div style="background:;"></div>';
    expect(removeLinebreaks(json.sections[7].markup)).eql(replacedRefs);
  });

  it('should replace modifier reference with all modifiers', function() {
    var replacedRefs = '<div style="background:modifier1;">modifier1</div><div style="background:modifier2;">modifier2</div>';
    expect(removeLinebreaks(json.sections[8].markup)).eql(replacedRefs);
  });

});
