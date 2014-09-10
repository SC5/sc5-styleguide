var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sass = require('gulp-ruby-sass');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');

var styleguide = require('./index.js');

gulp.task('styleguide', function() {
  return gulp.src(['lib/app/**/*.scss'])
    .pipe(styleguide());
});

/* Tasks for development */

gulp.task('js:app', function() {
  return gulp.src(['lib/app/js/**/*.js', 'lib/!app/js/vendor/**/*.js'])
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
      
    }))
    .pipe(gulp.dest('lib/public/css'));
});

gulp.task('html', function() {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest('lib/public/'));
});

gulp.task('watch', ['sass', 'js:app', 'js:vendor', 'html'], function() {
  livereload.listen();

  watch({glob: 'lib/app/sass/**/*.scss'}, function() {
      gulp.start('sass');
  });

  watch({glob: ['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js']}, function() {
      gulp.start('js:app');
  });

  watch({glob: ['lib/app/js/vendor/**/*.js']}, function() {
      gulp.start('js:vendor');
  });

  watch({glob: 'lib/app/**/*.html'}, function() {
      gulp.start('html');
  });

  gulp.watch('lib/public/**').on('change', function() {
    gulp.start('styleguide');
    livereload.changed();
  });
});

gulp.task('build', ['sass', 'js:app', 'js:vendor', 'html']);