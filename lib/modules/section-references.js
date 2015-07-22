var referenceDictionary = require('./reference-dictionary'),
    buildReferenceDictionary = referenceDictionary.build;

function replaceReferences(sections) {
  // TODO: Not to calculate twice
  var index = buildReferenceDictionary(sections);

  return sections.map(function(section) {
    var sectionContentVariable = /<sg\-insert>(.*)<\/sg\-insert>/,
        result,
        replacer = function(modifier) {
          /* Wrap modifier markup */
          modifier.markup = modifier.markup.replace(sectionContentReferenceTag, referencedSectionContent);
        };
    while ((result = sectionContentVariable.exec(section.markup))) {
      var sectionContentIdentifier = result[1],
        referencedSectionContent = '',
        sectionContentReferenceTag = '<sg-insert>' + sectionContentIdentifier + '</sg-insert>';

      if (index.hasOwnProperty(sectionContentIdentifier) && index[sectionContentIdentifier].markup !== 'undefined') {
        referencedSectionContent = index[sectionContentIdentifier].markup;
        // replace modifiers from referenced section
        referencedSectionContent = referencedSectionContent.replace('{$modifiers}', '');
      }
      if (referencedSectionContent === '') {
        referencedSectionContent = '[ERROR: Referenced section ' + sectionContentIdentifier + ' has no markup!]';
      } else if (referencedSectionContent.search(sectionContentReferenceTag) > 0) {
        console.log('You can\'t reference a section that references the section back as this will end in an endless loop');
        referencedSectionContent = '[ERROR: Reference to ' + sectionContentIdentifier + ' failed!]';
      }
      section.markup = section.markup.replace(sectionContentReferenceTag, referencedSectionContent);

      /* Wrap modifiers */
      section.modifiers.forEach(replacer);
    }
    return section;
  });
}

module.exports.replace = replaceReferences;
