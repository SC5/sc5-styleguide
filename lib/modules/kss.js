
'use strict';
var kss = require('kss'),
  path = require('path'),
  Q = require('q'),
  kssSplitter = require('./kss-splitter'),
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

function trimLinebreaks(str) {
  // Remove leading and trailing whitespaces
  if (!str) {
    return str;
  }
  return str.replace(/^[\r\n]+|[\r\n]+$/g, '');
}

function sanitize(string) {
  return sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
}

function processBlock(block, options, json) {
  var blockPromise = Q.defer();

  kss.parse(block.kss, options, function(err, styleguide) {
    var section,
      blockStyles;
    if (err) {
      new PluginError(PLUGIN_NAME, 'Error parsing', err);
      blockPromise.resolve();
      return false;
    } else {
      section = jsonSections(styleguide.section());

      if (section.length > 0) {
        if (section.length > 1) {
          console.warn('Warning: KSS splitter returned more than 1 KSS block. Styleguide might not be properly generated.');
        }
        blockStyles = trimLinebreaks(block.code);

        // Add related CSS to section
        if (blockStyles && blockStyles !== '') {
          section[0].css = blockStyles;
        }
        json.sections = json.sections.concat(section);
      }
      blockPromise.resolve();
    }
  });
  return blockPromise;
}

function processFile(contents, syntax, options, json) {
  var filePromise = Q.defer(),
    blockPromises = [],
    splittedFile = kssSplitter.getBlocks(contents, syntax);

  // Process every block in the current file
  splittedFile.forEach(function(block) {
    blockPromises.push(processBlock(block, options, json));
  });

  Q.all(blockPromises).then(function() {
    // All blocks are processed, resolve file promise
    filePromise.resolve();
  });

  return filePromise;
}

module.exports = {
  // Parse node-kss object ( {'file.path': 'file.contents.toString('utf8'}' )
  parseKSS: function(files, options, success) {
    var json = {
      sections: []
    },
    filePromises = [],
    fileKeys = Object.keys(files);

    fileKeys.forEach(function(filePath) {
      var contents = files[filePath],
        syntax = path.extname(filePath).substring(1);
      filePromises.push(processFile(contents, syntax, options, json));
    });

    Q.all(filePromises).then(function() {
      // All files are processed. Call success callback
      success(json);
    });
  }
}
