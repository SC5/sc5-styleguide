var gulp = require('gulp'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    ngAnnotate = require('gulp-ng-annotate'),
    replace = require('gulp-replace'),
    runSequence = require('run-sequence'),
    toc = require('gulp-doctoc'),
    styleguide = require('./lib/styleguide'),
    sass = require('gulp-sass'),
    please = require('gulp-pleeease'),
    neat = require('node-neat'),
    rimraf = require('gulp-rimraf'),
    distPath = 'lib/dist',
    fs = require('fs'),
    chalk = require('chalk'),
    outputPath = 'demo-output';

require('./gulpfile-tests.babel')(gulp);

gulp.task('js:app', () => {
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

gulp.task('js:vendor', ['bower'], () => {
  return gulp.src(['lib/app/js/vendor/**/*.js'].concat(mainBowerFiles({filter: /\.js/})))
    .pipe(plumber())
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(distPath + '/js'));
});

gulp.task('bower', () => {
  return bower();
});

gulp.task('sass', () => {
  return gulp.src('lib/app/sass/**/*')
    .pipe(gulp.dest(distPath + '/sass'));
});

gulp.task('html', () => {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest(distPath + '/'));
});

gulp.task('assets', () => {
  return gulp.src('lib/app/assets/**')
    .pipe(gulp.dest(distPath + '/assets'));
});

gulp.task('clean-dist', function () {
  return gulp.src(distPath, {read: false})
    .pipe(rimraf());
});

// Copy test directives to output even when running gulp dev
gulp.task('dev:static', () => {
  gulp.src(['lib/demo/**'])
    .pipe(gulp.dest(outputPath + '/demo'));
});

gulp.task('dev:doc', () => {
  return gulp.src('**/README.md')
    .pipe(toc())
    .pipe(replace(/[^\n]*Table of Contents[^\n]*\n/g, ''))
    .pipe(gulp.dest('./'));
});

gulp.task('dev:generate', () => {
  return gulp.src(['lib/app/sass/**/*.scss'])
    .pipe(styleguide.generate({
      title: 'SC5 Styleguide',
      server: true,
      rootPath: outputPath,
      overviewPath: 'README.md',
      styleVariables: 'lib/app/sass/_styleguide_variables.scss'
    }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('dev:applystyles', () => {
  if (!fs.existsSync(distPath)) {
    process.stderr.write(chalk.red.bold('Error:') + ' Directory ' + distPath + ' does not exist. You probably installed library by cloning repository directly instead of NPM repository.\n');
    process.stderr.write('You need to run ' + chalk.green.bold('gulp build') + ' first\n');
    process.exit(1);
    return 1;
  }
  return gulp.src([distPath + '/sass/*.scss'])
    .pipe(sass({
        includePaths: neat.includePaths
    }))
    .pipe(please({
        minifier: false
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

gulp.task('dev', ['dev:doc', 'dev:static', 'dev:applystyles', 'dev:generate'], () => {
  // Do intial full build and create styleguide
  runSequence('build', 'dev:generate');

  gulp.watch('lib/app/sass/**/*.scss', () => {
    runSequence('sass', 'dev:applystyles', 'dev:generate');
  });
  gulp.watch(['lib/app/js/**/*.js', 'lib/app/views/**/*', 'lib/app/index.html', '!lib/app/js/vendor/**/*.js'], () => {
    gulp.start('lint:js');
    runSequence('js:app', 'dev:generate');
  });
  gulp.watch('lib/app/js/vendor/**/*.js', () => {
    runSequence('js:vendor', 'dev:generate');
  });
  gulp.watch('lib/app/**/*.html', () => {
    runSequence('html', 'dev:generate');
  });
  gulp.watch('README.md', ['dev:doc', 'dev:generate']);
  gulp.watch('lib/styleguide.js', ['dev:generate']);
});

gulp.task('build:dist', ['sass', 'js:app', 'js:vendor', 'html', 'assets']);

gulp.task('build', ['clean-dist'], () => {
  runSequence('build:dist');
});

gulp.task('changelog', () => {

  require('conventional-changelog')({
    repository: 'https://github.com/SC5/sc5-styleguide',
    version: require('./package.json').version,
    file: ''
  }, (err, log) => {
    fs.writeFile('./CHANGELOG_LATEST.md', log, (err) => {
      if (err) {
        console.log(err);

      } else {
        console.log('The latest changelog was updated\n\n');
        console.log(log);
      }
    });
  });

});

gulp.task('publish', ['build', 'changelog']);
