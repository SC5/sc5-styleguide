'use strict';

var stream = require('stream'),
  through = require('through2'),
  minimatch = require('minimatch'),
  File = require('vinyl'),
  Q = require('q'),
  _ = require('lodash');

function toArray(args) {
  return _.isArray(args[0]) ? args[0] : Array.prototype.slice.call(args);
}

function read(files) {
  return function() {
    files.forEach(this.push.bind(this));
    this.push(null);
  };
}

function match(path, patterns) {
  var pattern = _.isArray(patterns) ? patterns : [patterns],
      matches = minimatch.bind(null, path);
  return _.any(pattern, matches);
}

module.exports = {

  createFile: function(fileSpec) {
    return new File({
      path: fileSpec.path,
      contents: new Buffer(fileSpec.contents)
    });
  },

  createReadStream: function() {
    var files = toArray(arguments),
        readable = stream.Readable({objectMode: true});
    readable._read = read(files);
    return readable;
  },

  src: function(files, pattern) {
    var _this = this,
        matchingFiles = files.reduce(function(result, f) {
      if (match(f.path, pattern)) {
        result.push(_this.createFile(f));
      }
      return result;
    }, []);
    return this.createReadStream(matchingFiles);
  },

  readStreamContents: function(stream) {
    return Q.Promise(function(resolve, reject) {
      try {
        var data = [],
          drain = function(file, enc, done) {
            data.push(file);
            done();
          },
          finish = function(callback) {
            resolve(data);
            callback();
          };
        stream.pipe(through.obj(drain, finish).on('error', reject));
      } catch (err) {
        reject(err);
      }
    });
  }

};
