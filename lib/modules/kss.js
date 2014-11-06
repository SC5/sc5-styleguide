
'use strict';
var kss = require('kss'),
  sanitizeHtml = require('sanitize-html'),
  wrapperMarkup = require('./wrapper-markup');

// Parses kss.KssSection to JSON
function jsonSections(sections) {
  return sections.map(function(section) {
    return {
      header: section.header(),
      description: sanitize(section.description()),
      modifiers: jsonModifiers(section.modifiers()),
      deprecated: section.deprecated(),
      experimental: section.experimental(),
      reference: section.reference(),
      markup: section.markup() ? section.markup().toString() : null
    }
  });
}

// Parses kss.KssModifier to JSON
function jsonModifiers(modifiers) {
  return modifiers.map(function(modifier, id) {
    return {
      id: id + 1,
      name: modifier.name(),
      description: sanitize(modifier.description()),
      className: modifier.className(),
      markup: modifier.markup() ? modifier.markup().toString() : null
    }
  });
}

function sanitize(string) {
  return sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
}

module.exports = {

  // Parse node-kss object ( {'file.path': 'file.contents.toString('utf8'}' )
  parseKSS: function(files, options, success) {
  var json = {};
  kss.parse(files, options, function(err, styleguide) {
    if (err) {
      new PluginError(PLUGIN_NAME, 'Error parsing', err);
      return false;
    } else {
      json.sections = jsonSections(styleguide.section());

      /* Make inherited wrappers */
      json.sections = wrapperMarkup.generateSectionWrapperMarkup(json.sections);

      if (typeof success === 'function') {
        success(json);
      }
    }
  });
}

}
