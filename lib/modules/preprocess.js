'use strict';

var concat = require('gulp-concat'),
  es = require('event-stream'),
  filter = require('gulp-filter'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  vfs = require('vinyl-fs'),
  _ = require('lodash'),
  proxyOnce = function(obj, key, fn) {
    var original = obj[key];
    obj[key] = function proxy() {
      var args = Array.prototype.slice.call(arguments);
      if (_.isFunction(fn)) {
        fn.apply(undefined, args);
      }
      if (_.isFunction(original)) {
        original.apply(undefined, args);
      }
      obj[key] = original;
    }
  };

module.exports = {
  // Processes all SASS/LESS/CSS files and combine to a single file
  getStream: function(files, opt) {
    var sassStream,
    lessStream,
    cssStream;

    proxyOnce(opt.sass, 'onError', opt.onCompileError);
    proxyOnce(opt.sass, 'onSuccess', opt.onCompileSuccess);

    sassStream = vfs.src(opt.sass.src || files)
      .pipe(filter('**/*.scss'))
      .pipe(sass(opt.sass))
      .pipe(concat('sass.css'));

    lessStream = vfs.src(opt.less.src || files)
      .pipe(filter('**/*.less'))
      .pipe(less(opt.less))
      .on('error', function(err) {
        console.error('An error occurred when compiling LESS');
        console.error(err.toString());
      })
      .pipe(concat('less.css'));

    cssStream = vfs.src(files)
      .pipe(filter('**/*.css'))
      .pipe(concat('css.css'));

    return es.merge(sassStream, lessStream, cssStream)
      .pipe(concat('styleguide.css'));
  }

};
