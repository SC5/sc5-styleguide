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

/* Tasks for development */

gulp.task('js', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(plumber())
    .pipe(concat('app.js'))
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

gulp.task('watch', function() {
  process.env['DEBUG'] = 'scyleguide';
  gulp.start('default');

  watch({glob: 'app/sass/**/*.scss'}, function() {
      gulp.start('sass');
  });
  watch({glob: 'app/js/**/*.js'}, function() {
      gulp.start('js');
  });
});