var gulp = require('gulp'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr')(),
    neat = require('node-neat'),
    please = require('gulp-pleeease'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    util = require('gulp-util'),
    bower = require('gulp-bower'),
    notifyLivereload,
    mainBowerFiles = require('main-bower-files'),
    path = require('path'),
    jscs = require('gulp-jscs'),
    runSequence = require('run-sequence'),
    styleguide = require('./lib/styleguide'),
    distPath = './lib/dist',
    configPath = util.env.config ? util.env.config.replace(/\/$/, '') : null,
    outputPath = util.env.output ? util.env.output.replace(/\/$/, '') : '',
    sourcePath = util.env.source ? util.env.source.replace(/\/$/, '') : '',
    config = configPath ? path.resolve('./' + configPath) : {};

var createStyleguide = function() {
  // Resolve overviewPath in relation to config file location 
  var overviewPath;
  if (config.overviewPath) {
    overviewPath = path.resolve(path.dirname(configPath), config.overviewPath);
  }
  return gulp.src([sourcePath + '/**/*.scss'])
    .pipe(styleguide({
      extraHead: config.extraHead,
      outputPath: outputPath,
      overviewPath: overviewPath,
      sass: {
        loadPath: neat.includePaths
      }
    }));
};

/* Tasks for development */
gulp.task('serve', function() {
  var app = require('./lib/server').app,
    server = require('./lib/server').server;

  outputPath = path.resolve(process.cwd(), outputPath);
  sourcePath = path.resolve(process.cwd(), sourcePath);
  serverModule = require('./lib/server')(sourcePath, outputPath);
  app = serverModule.app;
  server = serverModule.server;
  app.set('port', util.env.port || 3000);
  server = server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
  });
  lr.listen(35729);
});

gulp.task('jscs', function() {
  return gulp.src(['lib/*.js'])
    .pipe(jscs());
});

gulp.task('styleguide', function() {
  return createStyleguide();
});

gulp.task('build-styleguide', ['build'], function() {
  return createStyleguide();
});

gulp.task('js:app', function() {
  return gulp.src(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'])
    .pipe(plumber())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(distPath + '/js'));
});

gulp.task('js:vendor', ['bower'], function() {
  return gulp.src(['lib/app/js/vendor/**/*.js'].concat(mainBowerFiles({filter: /\.js/})))
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(distPath + '/js'));
});

gulp.task('bower', function() {
  return bower();
});

gulp.task('sass', function() {
  return gulp.src('lib/app/sass/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      // Include bourbon & neat
      includePaths: neat.includePaths
    }))
    .pipe(sourcemaps.init())
    .pipe(please({
      minifier: false
    }))
    .pipe(gulp.dest(distPath + '/css'));
});

gulp.task('html', function() {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest(distPath + '/'));
});

gulp.task('assets', function() {
  return gulp.src('lib/app/assets/**')
    .pipe(gulp.dest(distPath + '/assets'));
});

gulp.task('watch', ['build-styleguide', 'serve'], function() {
  gulp.watch('lib/app/sass/**/*.scss', function() {
    runSequence('sass', 'styleguide');
  });
  gulp.watch(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'], function() {
    runSequence('js:app', 'styleguide');
  });
  gulp.watch('lib/app/js/vendor/**/*.js', function() {
    runSequence('js:vendor', 'styleguide');
  });
  gulp.watch('lib/app/**/*.html', function() {
    runSequence('html', 'styleguide');
  });
  gulp.watch('lib/styleguide.js', ['styleguide']);
  gulp.watch(sourcePath + '/**', ['styleguide']);
});

gulp.task('production-watch', ['serve'], function() {
  gulp.watch(sourcePath + '/**', function(event) {
    runSequence('styleguide', function() {
      gulp.src(event.path, {read: false}).pipe(require('gulp-livereload')(lr));
    });
  });
});

gulp.task('build', ['sass', 'js:app', 'js:vendor', 'html', 'assets']);
