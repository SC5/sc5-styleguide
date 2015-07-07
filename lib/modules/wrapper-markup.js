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

function generateSectionWrapperMarkup(sections, index) {
    /* Calculate own wrapper */
    var wrapper,
        wrapperKeyword = '<sg-wrapper-content/>';

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
}

function replaceSectionVariables(sections, index) {
    return sections.map(function(section) {
        var sectionContentVariable = /\<sg\-content\>(.*)\<\/sg\-content\>/;
        while ((result = sectionContentVariable.exec(section.markup))) {
            var sectionContentIdentifier = result[1],
                referencedSectionContent = '',
                sectionContentReferenceTag = '<sg-content>' + sectionContentIdentifier + '</sg-content>';

            if (index.hasOwnProperty(sectionContentIdentifier) && index[sectionContentIdentifier].markup != 'undefined') {
                referencedSectionContent = index[sectionContentIdentifier].markup;
                // replace modifiers from referenced section
                referencedSectionContent = referencedSectionContent.replace('{$modifiers}','');
            }
            if (referencedSectionContent == '') {
                referencedSectionContent = '[ERROR: Referenced section ' + sectionContentIdentifier + ' has no markup!]';
            } else if (referencedSectionContent.search(sectionContentReferenceTag) > 0) {
                console.log('You can\'t reference a section that references the section back as this will end in an endless loop');
                referencedSectionContent = '[ERROR: Reference to ' + sectionContentIdentifier + ' failed!]';
            }
            section.markup = section.markup.replace(sectionContentReferenceTag, referencedSectionContent);
            section.wrappedMarkup = section.wrappedMarkup.replace(sectionContentReferenceTag, referencedSectionContent);

            /* Wrap modifiers */
            section.modifiers.forEach(function(modifier) {
                /* Wrap modifier markup */
                modifier.markup = modifier.markup.replace(sectionContentReferenceTag, referencedSectionContent);
                modifier.wrappedMarkup = modifier.wrappedMarkup.replace(sectionContentReferenceTag, referencedSectionContent);
            });
        }
        return section;
    });
}


module.exports.replaceSectionVariables = function(sections) {
    var index = buildReferenceDictionary(sections);

    sections = generateSectionWrapperMarkup(sections, index);
    sections = replaceSectionVariables(sections, index);

    return sections;
};
