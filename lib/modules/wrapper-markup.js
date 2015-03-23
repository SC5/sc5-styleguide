function buildReferenceDictionary(sections) {
  var prevSections = [],
    index = {},
    nested = {
      sections: []
    },
    cursor = nested.sections;

  sections.forEach(function(section) {
    var ref = section.reference, par, length;
    /* Check if the parent section was already mentioned
     * in the tree */
    /* Put cursor to the root for the root elements */
    if (ref.indexOf('.') === -1 || ref.indexOf('.0', ref.length - 2) !== -1) {
      cursor = nested.sections;
    }
    while (ref.indexOf('.') !== -1) {
      ref = ref.substring(0, ref.lastIndexOf('.'));

      /* Parent section */
      par = prevSections[prevSections.indexOf(ref)];
      if (par) {
        section.parentReference = par;
        /* Create nested container if it does not exists yet */
        index[par].sections = index[par].sections || [];
        cursor = index[par].sections;
        break;
      }
    }
    prevSections.push(section.reference);
    /* Remember where we put current section */
    length = cursor.push(section);
    index[section.reference] = cursor[length - 1];
  });

  return index;
}

module.exports.generateSectionWrapperMarkup = function(sections) {
  /* Calculate own wrapper */
  var wrapper,
    wrapperKeyword = '<sg-wrapper-content/>',
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
      section.wrappedMarkup = section.markup;
      section.wrappedMarkup = section.wrapper.replace(wrapperKeyword, section.markup);
    }

    /* Wrap modifiers */
    section.modifiers.forEach(function(modifier) {
      /* Wrap modifier markup */
      modifier.wrappedMarkup = modifier.markup;
      modifier.wrappedMarkup = section.wrapper.replace(wrapperKeyword, modifier.markup);
    });

    /* Clean nested sections */
    delete section.sections;
    return section;
  });
};
