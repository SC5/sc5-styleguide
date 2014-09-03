var gulp = require('gulp');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sass = require('gulp-ruby-sass');
var watch = require('gulp-watch');

gulp.task('default', function(development) {

  var debug = require('debug')('scyleguide');
  var app = require('./app');

  app.set('port', process.env.PORT || 3000);

  var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
  });

});

var styleguide = require('./index.js');

gulp.task('styleguide', function() {
  return gulp.src(['./*.less'])
    .pipe(styleguide());
});

/* Tasks for development */

gulp.task('js:app', function() {
  return gulp.src(['app/js/**/*.js', '!app/js/vendor/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('js:vendor', function() {
  return gulp.src('app/js/vendor/**/*.js')
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('sass', function() {
  return gulp.src('app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      compass: true
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('html', function() {
  return gulp.src('app/**/*.html')
    .pipe(gulp.dest('public/'));
});

gulp.task('watch', function() {
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
});