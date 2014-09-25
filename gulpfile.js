var gulp = require('gulp'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    neat = require('node-neat'),
    styleguide = require('./lib/styleguide');

/* Tasks for development */
gulp.task('serve', ['styleguide'], function() {

  var app = require('./lib/server').app,
    server = require('./lib/server').server;

  app.set('port', process.env.PORT || 3000);

  server = server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
  });

});

gulp.task('styleguide', function() {
  return gulp.src(['lib/app/**/*.scss'])
    .pipe(styleguide({
      dest: 'demo',
      markdownPath: 'README.md',
      sass: {
        loadPath: neat.includePaths
      }
    }));
});

gulp.task('js:app', function() {
  return gulp.src(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest('lib/dist/js'));
});

gulp.task('js:vendor', function() {
  return gulp.src('lib/app/js/vendor/**/*.js')
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('lib/dist/js'));
});

gulp.task('sass', function() {
  return gulp.src('lib/app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      // Include bourbon & neat
      includePaths: neat.includePaths
    }))
    .pipe(gulp.dest('lib/dist/css'));
});

gulp.task('html', function() {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest('lib/dist/'));
});

gulp.task('assets', function() {
  return gulp.src('lib/app/assets/**')
    .pipe(gulp.dest('lib/dist/assets/'));
});

gulp.task('watch', ['sass', 'js:app', 'js:vendor', 'html', 'assets'], function() {
  livereload.listen();
  gulp.watch('lib/app/sass/**/*.scss', ['sass']);
  gulp.watch(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'], ['js:app']);
  gulp.watch('lib/app/js/vendor/**/*.js', ['js:vendor']);
  gulp.watch('lib/app/**/*.html', ['html']);
  gulp.watch('lib/dist/**', ['styleguide']);
  gulp.start('serve');
});

gulp.task('build', ['sass', 'js:app', 'js:vendor', 'html', 'assets', 'styleguide']);

