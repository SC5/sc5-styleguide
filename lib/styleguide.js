/***
*
* gulp-styleguide
*
* Parses CSS/LESS/SASS files with KSS notation, creates a styleguide and
* hosts it along with our Angular.js based reader.
*
* Heavily influenced by node-kss and gulp-kss projects
*
***/

'use strict';
var through2 = require('through2');
var kss = require('kss');
var sanitizeHtml = require('sanitize-html');
var fs = require('fs');
var ncp = require('ncp');

module.exports = function(opt) {
  opt = {
    dest: opt.dest || 'styleguide/'
  };
  if (!opt.kssOpt) opt.kssOpt = {};

  // Files object acts as our buffer
  var filesBuffer = {};

  // A stream through which each file will pass
  return through2(
    {
      objectMode: true,
      allowHalfOpen: false
    },
    // Buffer all filenames
    function(file, enc, cb) {
      if (file.isNull()) return;
      if (file.isStream()) {
        return console.error('Styleguide does not support streams!');
      }

      filesBuffer[file.path] = file.contents.toString('utf8');

      // Make sure file goes through the next gulp plugin
      this.push(file);

      // We're done with this file!
      cb();
    },
    // After reading all files, parse them and start server
    function(cb) {
      var styleguide = jsonStyleGuide(filesBuffer, opt.kssOpt);

      // Write generated styleguide JSON to disk
      fs.writeFile(__dirname + '/../public/data.json', JSON.stringify(styleguide), function(err, buff) {
        if (err) {
          return console.error('Error writing data.json', err);
        }
        
        // We're all done!
        ncp(__dirname + '/../public', opt.dest, function(err) {
          if (err) {
            return console.error('Error creating styleguide directory', err);
          }

          console.log('Styleguide created to', opt.dest);
          cb();
        });
      });
    });
};

/* Utility functions */

function sanitize(string) {
  string = sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
  string = string.replace(/(\r\n|\n|\r|\&quot\;)/g, '');
  return string;
}

// Parse node-kss object ( {'file.path': 'file.contents.toString('utf8'}' )
function jsonStyleGuide(files, options) {
  var json = {};

  kss.parse(files, options, function(err, styleguide) {
    if (err) {
      new PluginError(PLUGIN_NAME, 'Error parsing', err);
      return false;
    } else {
      json = jsonSections(styleguide.section());
    }
  });

  return json;
}

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
      markup: section.markup()
    }
  });
}

// Parses kss.KssModifier to JSON
function jsonModifiers(modifiers) {
  return modifiers.map(function(modifier) {
    return {
      name: modifier.name(),
      description: sanitize(modifier.description()),
      className: modifier.className(),
      markup: modifier.markup()
    }
  });
}