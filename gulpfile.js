var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');
var neat = require('node-neat');

var styleguide = require('./index.js');

/* Tasks for development */

gulp.task('serve', ['styleguide'],function() {
  return gulp.src('demo')
    .pipe(webserver({
      livereload: true,
      open: false,
      fallback: 'index.html'
    }));
});

gulp.task('styleguide', function() {
  return gulp.src(['lib/app/**/*.scss'])
    .pipe(styleguide({
      dest: 'demo',
      sass: {
        loadPath: neat.includePaths
      }
    }));
});

gulp.task('js:app', function() {
  return gulp.src(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('lib/public/js'));
});

gulp.task('js:vendor', function() {
  return gulp.src('lib/app/js/vendor/**/*.js')
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('lib/public/js'));
});

gulp.task('sass', function() {
  return gulp.src('lib/app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      // Include bourbon & neat
      includePaths: neat.includePaths
    }))
    .pipe(gulp.dest('lib/public/css'));
});

gulp.task('html', function() {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest('lib/public/'));
});

gulp.task('watch', ['sass', 'js:app', 'js:vendor', 'html'], function() {
  gulp.watch('lib/app/sass/**/*.scss', ['sass']);

  gulp.watch(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'], ['js:app']);

  gulp.watch('lib/app/js/vendor/**/*.js', ['js:vendor']);

  gulp.watch('lib/app/**/*.html', ['html']);

  gulp.watch('lib/public/**', ['styleguide']);

  gulp.start('serve');
});

gulp.task('build', ['sass', 'js:app', 'js:vendor', 'html']);