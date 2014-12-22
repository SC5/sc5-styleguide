'use strict';

function trimLinebreaks(str) {
  // Remove leading and trailing linebreaks
  if (!str) {
    return str;
  }
  return str.replace(/^[\r\n]+|[\r\n]+$/g, '');
}

module.exports = {

  /* Parses additional KSS params for the styleguide */
  get: function(source) {

    // Remove comment markup from comments
    var comment = source.split('//').join('').split('/*').join('').split('*/').join(''),
      additionalKssParams = {},
      _this = this;

    comment = trimLinebreaks(comment);

    comment.split('\n\n').forEach(function(markUpBlock) {

      var varName = markUpBlock.match(/([^:^\n]*):[\s\S]*\n/);
      if (varName && varName[1]) {
        varName = varName[1].trim();
      }
      if (varName && varName.substring(0, 3) === 'sg-') {
        additionalKssParams[varName] = _this.getValue(markUpBlock);
      }

    });

    return additionalKssParams;
  },

  /* Parses values */
  getValue: function(str) {
    return str.substring(str.indexOf('\n') + 1);
  }

};
