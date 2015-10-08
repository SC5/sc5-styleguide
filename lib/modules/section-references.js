var referenceDictionary = require('./reference-dictionary'),
    buildReferenceDictionary = referenceDictionary.build;

function replaceReferences(sections) {
  // TODO: Not to calculate twice
  var index = buildReferenceDictionary(sections);

  return sections.map(function(section) {
    var sectionContentVariable = /<sg\-insert>([0-9\.]*)(.*)<\/sg\-insert>/,
        result,
        replacer = function(modifier) {
          /* Wrap modifier markup */
          modifier.markup = modifier.markup.replace(sectionContentReferenceTag, referencedSectionContent);
        },
        modifierPlaceholder = /\{\$modifiers\}/g,
        reduceModifiers = function(previousValue, currentValue) {
          // Concat all modifiers
          return previousValue + currentValue.markup.replace(modifierPlaceholder, currentValue.className);
        };
    while ((result = sectionContentVariable.exec(section.markup))) {
      var sectionContentIdentifier = result[1],
        sectionModifierIdentifier = result[2],
        referencedSectionContent = '',
        sectionContentReferenceTag = '<sg-insert>' + sectionContentIdentifier + sectionModifierIdentifier + '</sg-insert>';

      if (index.hasOwnProperty(sectionContentIdentifier) && index[sectionContentIdentifier].markup !== 'undefined') {
        referencedSectionContent = index[sectionContentIdentifier].markup;
        // replace modifiers from referenced section
        if (sectionModifierIdentifier !== '' && sectionModifierIdentifier.length > 1) {
          sectionModifierIdentifier = sectionModifierIdentifier.substring(1);
          // If all is the modifier insert all variants..
          if (sectionModifierIdentifier === 'all') {
            referencedSectionContent = index[sectionContentIdentifier].modifiers.reduce(reduceModifiers, '');
          }else {
            //Arrays start with 0, modifiers with 1 => subtract 1
            sectionModifierIdentifier = parseInt(sectionModifierIdentifier, 10) - 1;
            var modifiers = index[sectionContentIdentifier].modifiers;
            // ..otherwise check if the modifier refered to exists
            if (modifiers.hasOwnProperty(sectionModifierIdentifier) && modifiers[sectionModifierIdentifier].className !== 'undefined') {
              var referencedModifierContent = index[sectionContentIdentifier].modifiers[sectionModifierIdentifier].className;
              referencedSectionContent = referencedSectionContent.replace(modifierPlaceholder, referencedModifierContent);
            }
          }
        }
        referencedSectionContent = referencedSectionContent.replace(modifierPlaceholder, '');
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
