var referenceDictionary = require('./reference-dictionary'),
    buildReferenceDictionary = referenceDictionary.build;

function findeAndReplace(section, property, index) {
  var sectionContentVariable = /<sg\-insert>([0-9\.]*)(.*)<\/sg\-insert>/,
      result,
      modifierPlaceholder = /\{\$modifiers\}/g;
  // Wrap modifiers
  function replacer (modifier) {
    return ((modifier.markup = modifier[property].replace(sectionContentReferenceTag, referencedSectionContent)));
  }
  // Concat all modifiers
  function reduceModifiers (previousValue, currentValue) {
    return previousValue + currentValue[property].replace(modifierPlaceholder, currentValue.className);
  }
  while ((result = sectionContentVariable.exec(section[property]))) {
    var sectionContentIdentifier = result[1],
      sectionModifierIdentifier = result[2],
      referencedSectionContent = '',
      sectionContentReferenceTag = '<sg-insert>' + sectionContentIdentifier + sectionModifierIdentifier + '</sg-insert>';

    if (index.hasOwnProperty(sectionContentIdentifier) && index[sectionContentIdentifier][property] !== 'undefined') {
      referencedSectionContent = index[sectionContentIdentifier].markup;
      // replace modifiers from referenced section
      if (sectionModifierIdentifier !== '' && sectionModifierIdentifier.length > 1) {
        sectionModifierIdentifier = sectionModifierIdentifier.substring(1);
        // If all is the modifier insert all variants..
        if (sectionModifierIdentifier === 'all') {
          referencedSectionContent = index[sectionContentIdentifier].modifiers.reduce(reduceModifiers, '');
        } else {
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
    section[property] = section[property].replace(sectionContentReferenceTag, referencedSectionContent);

    section.modifiers.forEach(replacer);
  }
}

function replaceReferences(sections) {
  // TODO: Not to calculate twice
  var index = buildReferenceDictionary(sections);
  return sections.map(function(section) {
    findeAndReplace(section, 'markup', index);
    findeAndReplace(section, 'sg-wrapper', index);
    return section;
  });
}

module.exports.replace = replaceReferences;
