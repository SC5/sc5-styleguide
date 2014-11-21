'use strict';

var concat = require('gulp-concat'),
  es = require('event-stream'),
  filter = require('gulp-filter'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  vfs = require('vinyl-fs');

module.exports = {

  /**
   * Process all SASS/LESS/CSS files and combine them into a single stream
   */
  getStream: function(files, opt, errback) {
    var sassStream, lessStream, cssStream;

    sassStream = vfs.src(opt.sass.src || files)
      .pipe(filter('**/*.scss'))
      .pipe(sass(opt.sass).on('error', errback))
      .pipe(concat('sass.css'));

    lessStream = vfs.src(opt.less.src || files)
      .pipe(filter('**/*.less'))
      .pipe(less(opt.less).on('error', errback))
      .pipe(concat('less.css'));

    cssStream = vfs.src(opt.css.src || files)
      .pipe(filter('**/*.css'))
      .pipe(concat('css.css'));

    return es.merge(sassStream, lessStream, cssStream)
      .pipe(concat('styleguide.css'));
  }

};
