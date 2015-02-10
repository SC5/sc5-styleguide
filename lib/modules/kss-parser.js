'use strict';
var kss = require('kss'),
  path = require('path'),
  Q = require('q'),
  gutil = require('gulp-util'),
  kssSplitter = require('./kss-splitter'),
  kssAdditionalParams = require('./kss-additional-params'),
  kssSanitizeParams = require('./kss-sanitize-params'),
  _ = require('lodash'),
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
    };
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
    };
  });
}

function trimLinebreaks(str) {
  // Remove leading and trailing linebreaks
  if (!str) {
    return str;
  }
  return str.replace(/^[\r\n]+|[\r\n]+$/g, '');
}

function sanitize(string) {

  var sanitized = sanitizeHtml(string, {allowedTags: [], allowedAttributes: []});
  // HACK: Remove extra parameters from descriotion
  sanitized = sanitized.split(/sg\-[^:]*:/)[0];
  return sanitized;
}

function processBlock(block, options) {
  return Q.Promise(function(resolve, reject) {

    // Get additional params
    var additionalParams = kssAdditionalParams.get(block.kss);

    block.sanitizedKss = kssSanitizeParams(block.kss);

    // Parse with original KSS library
    kss.parse(block.sanitizedKss, options, function(err, styleguide) {
      var section,
        blockStyles;
      if (err) {
        console.error('  error processing kss block', err);
        reject(err);
        return false;
      } else {
        section = jsonSections(styleguide.section());

        if (section.length > 0) {
          if (section.length > 1) {
            console.warn('Warning: KSS splitter returned more than 1 KSS block. Styleguide might not be properly generated.');
          }
          blockStyles = trimLinebreaks(block.code);

          // Add extra parameters
          section[0] = _.assign(section[0], additionalParams);

          // Add related CSS to section
          if (blockStyles && blockStyles !== '') {
            section[0].css = blockStyles;
          }
        }
        resolve(section);
      }
    });
  });
}

function processFile(contents, filePath, syntax, options) {
  if (!contents || contents.length === 0) {
    return Q.resolve([]);
  }

  return Q.Promise(function(resolve, reject) {
    var blockPromises = [],
        blocks;
    try {
      blocks = kssSplitter.getBlocks(contents, syntax);

      // Process every block in the current file
      blocks.forEach(function(block) {
        blockPromises.push(processBlock(block, options));
      });
    } catch (err) {
      reject(err);
    }
    Q.all(blockPromises).then(function(results) {
      resolve(results.reduce(function(memo, result) {
        var blockResult = result.valueOf();
        if (blockResult && blockResult.length > 0) {
          // Map syntax to every block. This is later used when parsing used variables
          // Finally add sections to array
          return memo.concat(blockResult.map(function(currentBlock) {
            currentBlock.syntax = syntax;
            currentBlock.file = filePath;
            return currentBlock;
          }));
        }
        return memo;
      }, []));
    });
  });
}

function toInt(s) {
  return parseInt(s, 10);
}

function quote(s) {
  return '"' + s + '"';
}

function bySectionReference(x, y) {
  var xs = x.reference.split('.').map(toInt),
      ys = y.reference.split('.').map(toInt),
      len = Math.min(xs.length, ys.length),
      cmp, i;
  for (i = 0; i < len; i += 1) {
    cmp = xs[i] - ys[i];
    if (cmp !== 0) {
      return cmp;
    }
  }
  len = xs.length - ys.length;
  if (len === 0) {
    throw new gutil.PluginError('kss-parser', 'Two sections defined with same number ' +
      x.reference + ': ' + quote(x.header) + ' and ' + quote(y.header));
  }
  return len;
}

module.exports = {
  // Parse node-kss object ( {'file.path': 'file.contents.toString('utf8'}' )
  parseKssSections: function(files, options) {
    return Q.Promise(function(resolve, reject) {
      var filePromises = [],
        sections = [];

      // Process every file
      Object.keys(files).forEach(function(filePath) {
        var contents = files[filePath],
          syntax = path.extname(filePath).substring(1);
        filePromises.push(processFile(contents, filePath, syntax, options));
      });
      // All files are processed
      Q.all(filePromises).then(function(results) {
        // Combine sections from every file to a single array
        results.map(function(result) {
          var fileSections = result.valueOf();
          if (fileSections && fileSections.length > 0) {
            sections = sections.concat(fileSections);
          }
        });

        // Sort sections by reference number and call main promise
        try {
          sections.sort(bySectionReference);
          resolve(sections);
        } catch (err) {
          reject(err);
        }
      }).catch(reject);
    });
  }
};
