var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sass = require('gulp-ruby-sass');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');

var styleguide = require('./index.js');

gulp.task('styleguide', function() {
  return gulp.src(['app/**/*.scss'])
    .pipe(styleguide());
});

/* Tasks for development */

gulp.task('js:app', function() {
  return gulp.src(['app/js/**/*.js', '!app/js/vendor/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('js:vendor', function() {
  return gulp.src('app/js/vendor/**/*.js')
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('sass', function() {
  return gulp.src('app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      
    }))
    .pipe(gulp.dest('dist/css'));
});

gulp.task('html', function() {
  return gulp.src('app/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['sass', 'js:app', 'js:vendor', 'html'], function() {
  livereload.listen();

  watch({glob: 'app/sass/**/*.scss'}, function() {
      gulp.start('sass');
  });

  watch({glob: ['app/js/**/*.js', '!app/js/vendor/**/*.js']}, function() {
      gulp.start('js:app');
  });

  watch({glob: ['app/js/vendor/**/*.js']}, function() {
      gulp.start('js:vendor');
  });

  watch({glob: 'app/**/*.html'}, function() {
      gulp.start('html');
  });

  gulp.watch('dist/**').on('change', function() {
    gulp.start('styleguide');
    livereload.changed();
  });
});

gulp.task('build', ['sass', 'js:app', 'js:vendor', 'html']);