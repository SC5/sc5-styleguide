var gulp = require('gulp'),
    concat = require('gulp-concat'),
    gulpIgnore = require('gulp-ignore'),
    neat = require('node-neat'),
    please = require('gulp-pleeease'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    util = require('gulp-util'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    path = require('path'),
    jscs = require('gulp-jscs'),
    runSequence = require('run-sequence'),
    styleguide = require('./lib/styleguide'),
    distPath = './lib/dist',
    fs = require('fs'),
    chalk = require('chalk'),
    extend = require('node.extend'),
    configPath = util.env.config ? util.env.config.replace(/\/$/, '') : null,
    outputPath = util.env.output ? util.env.output.replace(/\/$/, '') : '',
    sourcePath = util.env.source ? util.env.source.replace(/\/$/, '') : '',
    options = {};

function parseOptions() {
  var config = configPath ? require(configPath) : {};
  // Resolve overviewPath in relation to config file location
  if (config.overviewPath) {
    config.overviewPath = path.resolve(path.dirname(configPath), config.overviewPath);
  }
  if (config.sassVariables) {
    config.sassVariables = path.resolve(path.dirname(configPath), config.sassVariables);
  }
  options = extend({
    sass: {
      loadPath: neat.includePaths
    },
    socketIo: false
  }, config);
}

parseOptions();

/* Tasks for development */
gulp.task('serve', function() {
  // Since we are running our own server we can enable socketIO
  options.socketIo = true;
  var serverModule = require('./lib/server')({
    rootPath: outputPath,
    sassVariables: options.sassVariables
  }),
    app = serverModule.app,
    server = serverModule.server;

  app.set('port', util.env.port || 3000);
  server = server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
  });
});

gulp.task('jscs', function() {
  return gulp.src([
    '**/*.js'
  ])
  .pipe(gulpIgnore.exclude([
    'node_modules/**',
    'demo/**',
    'test/project/**',
    'test/angular/**'
  ]))
  .pipe(plumber())
  .pipe(jscs());
});

gulp.task('styleguide', function() {
  var distPath = '/lib/dist';
  if (!fs.existsSync(__dirname + distPath)) {
    process.stderr.write(chalk.red.bold('Error:') + ' Directory ' + distPath + ' does not exist. You probably installed library by cloning repository directly instead of NPM repository.\n');
    process.stderr.write('You need to run ' + chalk.green.bold('gulp build') + ' first\n');
    process.exit(1)
    return 1;
  }
  return gulp.src([sourcePath + '/**/*.scss'])
    .pipe(styleguide(options))
    .pipe(gulp.dest(outputPath));
});

gulp.task('js:app', function() {
  return gulp.src([
    'lib/app/js/app.js',
    'lib/app/js/controllers/*.js',
    'lib/app/js/directives/*.js',
    'lib/app/js/services/*.js'
  ])
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

gulp.task('demo', function() {
  configPath = __dirname + '/demo/source/styleguide_config.json';
  outputPath = __dirname + '/demo/output';
  sourcePath = __dirname + '/demo/source';
  // We need to re-parse options since configPath has changed
  parseOptions();
  // Run serve first so socketIO options is enabled when building styleguide
  return runSequence('serve', 'styleguide');
});

gulp.task('html', function() {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest(distPath + '/'));
});

gulp.task('assets', function() {
  return gulp.src('lib/app/assets/**')
    .pipe(gulp.dest(distPath + '/assets'));
});

gulp.task('watch', [], function() {
  // Do intial full build and create styleguide
  runSequence(['serve', 'build'], 'styleguide');

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
  gulp.start('jscs');
});

gulp.task('build', ['sass', 'js:app', 'js:vendor', 'html', 'assets']);

gulp.task('changelog', function() {

  require('conventional-changelog')({
    repository: 'https://github.com/SC5/sc5-styleguide',
    version: require('./package.json').version,
    file: ''
  }, function(err, log) {
    fs.writeFile('./CHANGELOG.md', log, function(err) {
      if (err) {
        console.log(err);

      } else {
        console.log('The changelog was updated\n\n');
        console.log(log);
      }
    });
  });

});

gulp.task('publish', ['build', 'changelog']);
