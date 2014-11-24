'use strict';

var concat = require('gulp-concat'),
  es = require('event-stream'),
  filter = require('gulp-filter'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  vfs = require('vinyl-fs');

function src(opt, glob, filterPattern) {
  if (opt) {
    return vfs.src(opt);
  }
  return vfs.src(glob).pipe(filter(filterPattern));
}

module.exports = {

  /**
   * Process all SASS/LESS/CSS files and combine them into a single stream
   */
  getStream: function(files, opt, errback) {
    var sassStream, lessStream, cssStream;

    sassStream = src(opt.sass.src, files, '**/*.scss')
      .pipe(sass(opt.sass).on('error', errback))
      .pipe(concat('sass.css'));

    lessStream = src(opt.less.src, files, '**/*.less')
      .pipe(less(opt.less).on('error', errback))
      .pipe(concat('less.css'));

    cssStream = src(opt.css.src, files, '**/*.css')
      .pipe(concat('css.css'));

    return es.merge(sassStream, lessStream, cssStream).on('error', errback)
      .pipe(concat('styleguide.css'));
  }

};
