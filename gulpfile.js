var gulp = require('gulp'),
    concat = require('gulp-concat'),
    neat = require('node-neat'),
    please = require('gulp-pleeease'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    util = require('gulp-util'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    ngAnnotate = require('gulp-ng-annotate'),
    path = require('path'),
    jscs = require('gulp-jscs'),
    jshint = require('gulp-jshint'),
    runSequence = require('run-sequence'),
    styleguide = require('./lib/styleguide'),
    distPath = './lib/dist',
    fs = require('fs'),
    chalk = require('chalk'),
    extend = require('node.extend'),
    through = require('through2'),
    istanbul = require('gulp-istanbul'),
    mocha = require('gulp-mocha'),
    karma = require('karma').server,
    coverage = require('istanbul'),
    sassSrc = ['lib/app/sass/app.scss', 'lib/app/sass/styleguide_helper_elements.scss'],
    configPath = util.env.config ? util.env.config.replace(/\/$/, '') : null,
    outputPath = util.env.output ? util.env.output.replace(/\/$/, '') : '',
    sourcePath = util.env.source ? util.env.source.replace(/\/$/, '') : '',
    options = {
      sass: {
        includePaths: neat.includePaths
      }
    };

function getBuildOptions() {
  var config = configPath ? require(configPath) : {};
  // Resolve overviewPath in relation to config file location
  if (config.overviewPath) {
    config.overviewPath = path.resolve(path.dirname(configPath), config.overviewPath);
  }
  if (config.styleVariables) {
    config.styleVariables = path.resolve(path.dirname(configPath), config.styleVariables);
  } else if (config.sassVariables) {
    // For backward compatibility
    config.styleVariables = path.resolve(path.dirname(configPath), config.sassVariables);
  }

  return extend({
    rootPath: outputPath
  }, options, config);
}

function srcJsLint() {
  return gulp.src([
    'gulpfile.js',
    'bin/**/*.js',
    'lib/**/*.js',
    'test/**/*.js',
    '!lib/dist/**/*.js',
    '!lib/app/js/components/**/*.js'
  ]);
}

gulp.task('jscs', function() {
  return srcJsLint()
    .pipe(plumber())
    .pipe(jscs({
      configPath: '.jscsrc'
    }));
});

gulp.task('jshint', function() {
  return srcJsLint()
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint:js', ['jscs', 'jshint']);

gulp.task('styleguide', function() {
  var distPath = '/lib/dist';
  if (!fs.existsSync(__dirname + distPath)) {
    process.stderr.write(chalk.red.bold('Error:') + ' Directory ' + distPath + ' does not exist. You probably installed library by cloning repository directly instead of NPM repository.\n');
    process.stderr.write('You need to run ' + chalk.green.bold('gulp build') + ' first\n');
    process.exit(1);
    return 1;
  }
  return gulp.src([sourcePath + '/**/*.scss'])
    .pipe(styleguide(getBuildOptions()))
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
  .pipe(ngAnnotate())
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
  return gulp.src(sassSrc)
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

gulp.task('sass:no-fail', function() {
  return gulp.src(sassSrc)
    .pipe(plumber())
    .pipe(sass({
      // Include bourbon & neat
      includePaths: neat.includePaths,
      errLogToConsole: true
    }))
    .pipe(sourcemaps.init())
    .pipe(please({
      minifier: false
    }))
    .pipe(gulp.dest(distPath + '/css'));
});

gulp.task('demo', function() {
  options.server = true;
  configPath = __dirname + '/lib/app/styleguide_config.json';
  sourcePath = __dirname + '/lib/app';
  outputPath = __dirname + '/demo-output';

  // Watch changed styles in demo mode
  gulp.watch(sourcePath + '/**/*.scss', function() {
    runSequence('sass:no-fail', 'styleguide');
  });
  // Run serve first so socketIO options is enabled when building styleguide
  return runSequence('styleguide');
});

gulp.task('html', function() {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest(distPath + '/'));
});

gulp.task('assets', function() {
  return gulp.src('lib/app/assets/**')
    .pipe(gulp.dest(distPath + '/assets'));
});

gulp.task('dev', function() {
  sourcePath = util.env.source ? util.env.source.replace(/\/$/, '') : 'lib/app';
  outputPath = util.env.output ? util.env.output.replace(/\/$/, '') : 'demo-output';
  configPath = util.env.config ? util.env.config.replace(/\/$/, '') : './lib/app/styleguide_config.json';
  runSequence('watch');
});

gulp.task('watch', [], function() {
  // Enable server by default when watching
  // Config have possibility to still override this
  options.server = true;

  // Do intial full build and create styleguide
  runSequence('build', 'styleguide');

  gulp.watch('lib/app/sass/**/*.scss', function() {
    runSequence('sass:no-fail', 'styleguide');
  });
  gulp.watch(['lib/app/js/**/*.js', '!lib/app/js/vendor/**/*.js'], function() {
    gulp.start('lint:js');
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

function runMocha() {
  return mocha({reporter: 'spec' });
}

gulp.task('test:unit', function(cb) {
  gulp.src(['lib/modules/**/*.js'])
    .pipe(istanbul({ includeUntested: true }))
    .on('finish', function() {
      gulp.src(['test/unit/**/*.js'])
        .pipe(runMocha())
        .pipe(istanbul.writeReports({
          reporters: ['json'],
          reportOpts: {
            file: 'coverage/unit-coverage.json'
          }
        }))
        .pipe(istanbul.writeReports({
          reporters: ['text']
        }))
        .on('end', cb);
    });
});

gulp.task('test:integration', function() {
  return gulp.src('test/integration/**/*.js')
    .pipe(runMocha());
});

gulp.task('test:angular', ['test:angular:unit', 'test:angular:functional']);

gulp.task('test:angular:unit', function(done) {
  karma.start({
    configFile: path.resolve(__dirname, 'test/karma.conf.js'),
    exclude: [
      'test/angular/functional/**/*.js'
    ]
  }, done);
});

gulp.task('test:angular:functional', function(done) {
  karma.start({
    configFile: path.resolve(__dirname, 'test/karma.conf.js'),
    exclude: ['test/angular/unit/**/*.js'],
    preprocessors: {},
    reporters: ['mocha']
  }, done);
});

gulp.task('test', function(done) {
  var del = require('del');
  del('coverage');
  runSequence('test:unit', 'test:angular', 'test:integration', 'lint:js', done);
});

gulp.task('generate-coverage-report', function() {
  var collector = new coverage.Collector(),
    lcov = coverage.Report.create('lcov', {
      dir: 'coverage'
    }),
    summary = coverage.Report.create('text');

  return gulp.src('coverage/*.json')
    .pipe(through.obj(function(file, enc, done) {
      collector.add(JSON.parse(file.contents.toString()));
      done();
    }, function(callback) {
      lcov.writeReport(collector);
      summary.writeReport(collector);
      callback();
    }));
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
