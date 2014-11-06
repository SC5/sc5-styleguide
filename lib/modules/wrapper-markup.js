/* Calculates a warpper for a section */
function ownWrapper(section) {
  var re, match,
      wrapper = '<sg:wrapper-content/>';

  re = /^([\s\S]*)<sg\:wrapper>([\s\S]*)<\/sg\:wrapper>([\s\S]*)$/;
  match = re.exec(section.markup);
  if (match) {
    wrapper = match[2];
  }
  return wrapper;
}

function buildReferenceDictionary(sections) {
  var cursor,
    prevSections = [],
    index = {},
    nested = {
      sections: []
    };

  sections.forEach(function(section) {
    /* Check if the parent section was already mentioned
     * in the tree */
    var ref = section.reference;
    /* Put cursor to the root for the root elements */
    if (ref.indexOf('.') == -1) {
      cursor = nested.sections;
    }
    while (ref.indexOf('.') != -1) {
      ref = ref.substring(0, ref.lastIndexOf('.'));

      /* Parent section */
      var par = prevSections[prevSections.indexOf(ref)];
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
    var length = cursor.push(section);
    index[section.reference] = cursor[length - 1];
  });

  return index;
}

module.exports.generateSectionWrapperMarkup = function(sections) {
  /* Calculate own wrapper */
  var wrapper,
    index = buildReferenceDictionary(sections);

  return sections.map(function(section) {
    wrapper = ownWrapper(section);
    /* Wrap a wrapper with a parent wrapper */
    if (section.parentReference) {
      var parentWrapper = index[section.parentReference].wrapper;
      wrapper = parentWrapper.replace('<sg:wrapper-content/>', wrapper);
    }
    section.wrapper = wrapper;

    if (section.markup) {
      /* Clean markup */
      if (section.markup.indexOf('<sg:wrapper>') != -1) {
        section.markup = section.markup.substring(0, section.markup.indexOf('<sg:wrapper'));
      }
      /* Wrap markup */
      section.wrappedMarkup = section.markup;
      section.wrappedMarkup = section.wrapper.replace('<sg:wrapper-content/>', section.markup);
    }

    /* Wrap modifiers */
    section.modifiers.forEach(function(modifier) {
      /* Clean modifier markup */
      if (modifier.markup.indexOf('<sg:wrapper>') != -1) {
        modifier.markup = modifier.markup.substring(0, modifier.markup.indexOf('<sg:wrapper'));
      }
      /* Wrap modifier markup */
      modifier.wrappedMarkup = modifier.markup;
      modifier.wrappedMarkup = section.wrapper.replace('<sg:wrapper-content/>', modifier.markup);
    });

    /* Clean nested sections */
    delete section.sections;
    return section;
  });
}
