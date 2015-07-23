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

module.exports.build = buildReferenceDictionary;
