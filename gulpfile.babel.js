var gulp = require('gulp'),
    gutil = require('gulp-util'),
    concat = require('gulp-concat'),
    clean = require('gulp-clean'),
    cssmin = require('gulp-cssmin'),
    ghPages = require('gulp-gh-pages'),
    gulpIgnore = require('gulp-ignore'),
    plumber = require('gulp-plumber'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    ngAnnotate = require('gulp-ng-annotate'),
    replace = require('gulp-replace'),
    runSequence = require('run-sequence'),
    toc = require('gulp-doctoc'),
    styleguide = require('./lib/styleguide'),
    postcss = require('gulp-postcss'),
    rename = require('gulp-rename'),
    rimraf = require('gulp-rimraf'),
    distPath = 'lib/dist',
    fs = require('fs'),
    chalk = require('chalk'),
    outputPath = 'demo-output',
    webserver = require('gulp-webserver');

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

gulp.task('copy:css', () => {
  return gulp.src('lib/app/css/**/*')
    .pipe(gulp.dest(distPath + '/css'));
});

gulp.task('html', () => {
  return gulp.src('lib/app/**/*.html')
    .pipe(gulp.dest(distPath + '/'));
});

gulp.task('assets', () => {
  return gulp.src('lib/app/assets/**')
    .pipe(gulp.dest(distPath + '/assets'));
});

gulp.task('clean:dist', function () {
  return gulp.src(distPath, {read: false})
    .pipe(rimraf());
});

// Copy test directives to output even when running gulp dev
gulp.task('dev:static', () => {
  gulp.src(['lib/demo/**'])
    .pipe(gulp.dest(outputPath + '/demo'));
});

gulp.task('dev:doc', () => {
  return gulp.src('README.md')
    .pipe(toc())
    .pipe(replace(/[^\n]*Table of Contents[^\n]*\n/g, ''))
    .pipe(gulp.dest('./'));
});

gulp.task('dev:generate', () => {
  return gulp.src([distPath + '/css/*.css'])
    .pipe(styleguide.generate({
      title: 'SC5 Styleguide',
      sideNav: false,
      showMarkupSection: true,
      hideSubsectionsOnMainSection: false,
      server: true,
      rootPath: outputPath,
      overviewPath: 'README.md',
      styleVariables: distPath + '/css/_styleguide_variables.css',
      includeDefaultStyles: true,
      parsers: {
        css: 'postcss'
      }
    }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('dev:applystyles', () => {
  if (!fs.existsSync(distPath) || !fs.existsSync(distPath + '/css/styleguide-app.css')) {
    process.stderr.write(chalk.red.bold('Error:') + ' Directory ' + distPath + ' does not exist. You probably installed library by cloning repository directly instead of NPM repository.\n');
    process.stderr.write('You need to run ' + chalk.green.bold('gulp build') + ' first\n');
    process.exit(1);
    return 1;
  }
  return gulp.src(distPath + '/css/styleguide-app.css')
    .pipe(replace('{{{appRoot}}}', ''))
    .pipe(postcss([
      require('postcss-partial-import'),
      require('postcss-mixins'),
      require('gulp-cssnext'),
      require('postcss-advanced-variables'),
      require('postcss-conditionals'),
      require('postcss-color-function'),
      require('postcss-color-alpha'),
      require('postcss-nested'),
      require('postcss-custom-media'),
      require('autoprefixer'),
      require('postcss-inline-comment')
    ]))
    .pipe(replace(/url\((.*)\)/g, function(replacement, parsedPath) {
      return 'url(\'' + parsedPath.replace(/'/g, '') + '\')';
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

gulp.task('dev', ['dev:doc', 'dev:static', 'build:dist'], () => {
  //Do intial full build and create styleguide
  runSequence('dev:generate', 'dev:applystyles');

  gulp.watch('lib/app/css/**/*.css', () => {
    runSequence('copy:css', 'dev:generate', 'dev:applystyles');
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

gulp.task('addsection', () => {
  return gulp.src(['lib/app/css/**/*.css'])
    .pipe(styleguide.addSection({
      parsers: {
        css: 'postcss'
      }
    }))
    .pipe(gulp.dest('lib/app/css/'));
});

gulp.task('build:dist', ['copy:css', 'js:app', 'js:vendor', 'html', 'assets']);

gulp.task('build', ['clean:dist'], () => {
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

gulp.task('friday', function() {
  var today = new Date();
  // For fridays only
  if (today.getDay() !== 5) {
      return;
  }
  gutil.log(gutil.colors.magenta('┓┏┓┏┓┃'));
  gutil.log(gutil.colors.magenta('┛┗┛┗┛┃'), gutil.colors.cyan('⟍ ○⟋'));
  gutil.log(gutil.colors.magenta('┓┏┓┏┓┃'), gutil.colors.cyan('  ∕       '), 'Friday');
  gutil.log(gutil.colors.magenta('┛┗┛┗┛┃'), gutil.colors.cyan('ノ)'));
  gutil.log(gutil.colors.magenta('┓┏┓┏┓┃'), '          ', 'release,');
  gutil.log(gutil.colors.magenta('┛┗┛┗┛┃'));
  gutil.log(gutil.colors.magenta('┓┏┓┏┓┃'), '          ', 'good');
  gutil.log(gutil.colors.magenta('┛┗┛┗┛┃'));
  gutil.log(gutil.colors.magenta('┓┏┓┏┓┃'), '          ', 'luck!');
  gutil.log(gutil.colors.magenta('┃┃┃┃┃┃'));
  gutil.log(gutil.colors.magenta('┻┻┻┻┻┻'));
});

gulp.task('publish', ['friday', 'build', 'changelog']);

var siteDir = './site/';

gulp.task('website', ['website:css'], function() {
  gulp.watch(siteDir + 'css/app.css', ['website:css']);

  gulp.src(siteDir)
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});

gulp.task('website:css', ()=> {
  gulp.src(siteDir + 'css/*.css')
    .pipe(gulpIgnore.exclude('*.min.css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(siteDir + 'css'));
});

gulp.task('website:deploy', ['website:deploy:clean'], () => {
  gulp.src(siteDir + '**/*')
    .pipe(ghPages({
      remoteUrl: 'git@github.com:SC5/sc5-styleguide.git'
    }));

});

gulp.task('website:deploy:clean', () => {
  gulp.src('.publish', { read: false })
    .pipe(clean());
});
