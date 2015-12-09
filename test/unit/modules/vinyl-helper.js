'use strict';

import stream from 'stream';
import through from 'through2';
import minimatch from 'minimatch';
import File from 'vinyl';
import Q from 'q';
import _ from 'lodash';

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

  createFile: (fileSpec) => {
    return new File({
      path: fileSpec.path,
      contents: new Buffer(fileSpec.contents)
    });
  },

  createReadStream: () => {
    var files = toArray(arguments),
        readable = stream.Readable({objectMode: true});
    readable._read = read(files);
    return readable;
  },

  src: (files, pattern) => {
    var _this = this,
        matchingFiles = files.reduce((result, f) => {
          if (match(f.path, pattern)) {
            result.push(_this.createFile(f));
          }
          return result;
        }, []);
    return this.createReadStream(matchingFiles);
  },

  readStreamContents: (stream) => {
    return Q.Promise((resolve, reject) => {
      try {
        var data = [],
          drain = (file, enc, done) => {
            data.push(file);
            done();
          },
          finish = (callback) => {
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
