'use strict';

function trimLinebreaks(str) {
  // Remove leading and trailing linebreaks
  if (!str) {
    return str;
  }
  return str.replace(/^[\r\n]+|[\r\n]+$/g, '');
}

function standardizeLinebreaks(str) {
  // Replace windows and mac line endings to unix line endings convention
  if (!str) {
    return str;
  }
  return str.replace(/\r?\n|\r/g, '\n');
}

// A list of params which need values parsing
var ComplexParams = [
  'sg-angular-directive'
];

module.exports = {

  /* Parses additional KSS params for the styleguide */
  get: function(source) {

    // Remove comment markup from comments
    var comment = source.split(/\/\/[ ]?/).join('').split('/*').join('').split('*/').join(''),
      additionalKssParams = {},
      _this = this;

    comment = standardizeLinebreaks(comment);
    comment = trimLinebreaks(comment);

    comment.split('\n\n').forEach(function(markUpBlock) {

      var varName = markUpBlock.match(/([^:^\n]*):[\s\S]*\n/);
      if (varName && varName[1] !== undefined) {
        varName = varName[1].trim();
      }
      if (varName && varName.substring(0, 3) === 'sg-') {
        additionalKssParams[varName] = _this.getValue(varName, markUpBlock);
      }

    });

    return additionalKssParams;
  },

  /* Parses values */
  getValue: function(varName, source) {

    var body = source.substring(source.indexOf('\n') + 1),
      result;

    // Do not parse every variable
    if (ComplexParams.indexOf(varName) === -1) {
      result = body;
    } else {

      result = {};

      body.split('\n').forEach(function(line) {

        var keyVal = line.split(':').map(function(str) {
          str = str.trim();
          if (str.indexOf(',') !== -1) {
            str = str.split(',').map(function(s) {
              return s.trim();
            });
          }
          return str;
        });

        if (!result[keyVal[0]]) {
          // Define new value
          result[keyVal[0]] = keyVal[1];
        } else {
          // Add another value
          if (!(result[keyVal[0]] instanceof Array)) {
            result[keyVal[0]] = [
              result[keyVal[0]]
            ];
          }
          result[keyVal[0]].push(keyVal[1]);
        }

      });
    }

    return result;
  }

};
