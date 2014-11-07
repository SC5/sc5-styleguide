'use srict';

var concat = require('gulp-concat'),
  es = require('event-stream'),
  filter = require('gulp-filter'),
  less = require('gulp-less'),
  sass = require('gulp-sass'),
  vfs = require('vinyl-fs'),
  plumber = require('gulp-plumber');

module.exports = {

  // Processes all SASS/LESS/CSS files and combine to a single file
  getStream: function(files, opt) {
    var sassStream,
    lessStream,
    cssStream,
    originalSassOnError = opt.sass.onError;

    opt.sass.onError = function(err) {
      console.error('An error occurred when compiling SASS');
      // TODO: Emit event to UI
      // Call original error handler if there was one
      if (typeof originalSassOnError === 'function') {
        originalSassOnError(err);
      }
    }

    sassStream = vfs.src(files)
      .pipe(filter('**/*.scss'))
      .pipe(sass(opt.sass))
      .pipe(concat('sass.css'));

    lessStream = vfs.src(files)
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

}
