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
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var kss = require('kss');
var sanitizeHtml = require('sanitize-html');

var PLUGIN_NAME = gutil.colors.green('gulp-styleguide');

/* Simple express.io server */
var express = require('express.io');
var app = require('express.io')();
app.http().io();
app.use(express.static(__dirname + '/public'));

module.exports = function(opt) {
  if (!opt) opt = {
    port: 3333
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
        return this.emit('error',
          new PluginError(PLUGIN_NAME, 'Streaming not supported'));
      }

      filesBuffer[file.path] = file.contents.toString('utf8');

      // Make sure file goes through the next gulp plugin
      this.push(file);

      // Tell gulp that we are done with this file
      cb();
    },
    // After reading all files, parse them and start server
    function(cb) {
      var styleguide = jsonStyleGuide(filesBuffer, opt.kssOpt);

      // Serve styleguide JSON
      app.get('/styleguide', function(req, res) {
        res.send(styleguide);
      });

      app.io.route('ready', function(req) {
        req.io.emit('update', styleguide);
      });

      app.listen(opt.port);
      gutil.log(PLUGIN_NAME, 'running at http://localhost:' + opt.port + '. Godspeed!');

      // TODO: Should tell gulp that we're done at some point
      // cb();
    });
};

/* Utility functions */

function sanitize(string) {
  string = sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
  string = string.replace(/(\r\n|\n|\r)/, '');
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
      className: modifier.className()
    }
  });
}