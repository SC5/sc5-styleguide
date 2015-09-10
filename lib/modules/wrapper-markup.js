var referenceDictionary = require('./reference-dictionary'),
    buildReferenceDictionary = referenceDictionary.build;

function generateSectionWrapperMarkup(sections) {
  /* Calculate own wrapper */
  var wrapper,
      wrapperKeyword = '<sg-wrapper-content/>',
  // TODO: do not calculate twice
      index = buildReferenceDictionary(sections);

  return sections.map(function(section) {
    wrapper = section['sg-wrapper'] || wrapperKeyword;
    /* Wrap a wrapper with a parent wrapper */
    if (section.parentReference) {
      var parentWrapper = index[section.parentReference].wrapper;
      wrapper = parentWrapper.replace(wrapperKeyword, wrapper);
    }

    section.wrapper = wrapper;
    if (section.markup) {
      /* Wrap markup */
      section.renderMarkup = section.markup;
      section.renderMarkup = section.wrapper.replace(wrapperKeyword, section.markup);
    }

    /* Wrap modifiers */
    section.modifiers.forEach(function(modifier) {
      /* Wrap modifier markup */
      modifier.rederMarkup = modifier.markup;
      modifier.renderMarkup = section.wrapper.replace(wrapperKeyword, modifier.markup);
    });

    /* Clean nested sections */
    delete section.sections;
    return section;
  });
}

module.exports.generateSectionWrapperMarkup = generateSectionWrapperMarkup;
