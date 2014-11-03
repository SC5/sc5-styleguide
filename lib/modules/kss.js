
'use strict';
var kss = require('kss'),
  sanitizeHtml = require('sanitize-html');

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
  var json = {},

  /* Stores links to sections representing
   * styleguide nested structure
   */
  nested = {
    sections: []
  };

  kss.parse(files, options, function(err, styleguide) {
    if (err) {
      new PluginError(PLUGIN_NAME, 'Error parsing', err);
      return false;
    } else {
      json.sections = jsonSections(styleguide.section());

      var prevSections = [],
        index = {},
        cursor,

        ownWrapper;

      json.sections.map(function(section) {
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

      /* Calculates a warpper for a section */
      var ownWrapper = function(section) {
        var re, match,
            wrapper = '<sg:wrapper-content/>';

        re = /^([\s\S]*)<sg\:wrapper>([\s\S]*)<\/sg\:wrapper>([\s\S]*)$/;
        match = re.exec(section.markup);
        if (match) {
          wrapper = match[2];
        }
        return wrapper;
      }

      /* Make inherited wrappers */
      json.sections.map(function(section) {

        /* Calculate own wrapper */
        var wrapper = ownWrapper(section);
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
      if (typeof success === 'function') {
        success(json);
      }
    }
  });
}

}
