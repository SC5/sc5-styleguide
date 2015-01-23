exports.main = function() {

  var path = require('path'),
    styleguide = require(path.resolve(__dirname, '../lib/styleguide.js')),
    gulp = require('gulp'),
    runSequence = require('run-sequence'),
    chalk = require('chalk'),
    yargs = require('yargs'),
    argv;

  argv = yargs
    .usage('Generate sc5-styleguide')
    .example('$0 --kssSource <source files> --styleSource <preprocessed CSS files> --output <dest>', 'Generate a styleguide')
    .demand('kssSource', chalk.red('Please provide sources of KSS files'))
    .demand('styleSource', chalk.red('Please provide sources of preprocessed files'))
    .demand('output', chalk.red('Please provide output path'))
    .describe('kssSource', 'KSS source file(s)')
    .describe('styleSource', 'Preprocessed styles')
    .describe('title', 'This string is used as a page title and in the page header')
    .describe('extraHead', 'These HTML elements are injected inside the style guide head-tag')
    .describe('commonClass', 'The provided classes are added to all preview blocks in the generated style guide')
    .describe('appRoot', 'Define the appRoot parameter if you are hosting the style guide from a directory other than the root directory of the HTTP server')
    .describe('styleVariables', 'By default variable definitions are searched from every file passed in gulp.src. styleVariables parameter could be used to filter from which files variables are loaded')
    .describe('server', 'Enable built-in web-server. To enable Desiger tool the style guide must be served with the built-in web server')
    .describe('port', 'Port of the server. Default is 3000')
    .describe('watch', 'Automatically generate styleguide on file change')
    .argv;

  gulp.task('styleguide:generate', function() {
    return gulp.src(argv.kssSource)
      .pipe(styleguide.generate({
        title: argv.title,
        rootPath: argv.output,
        extraHead: argv.extraHead,
        commonClass: argv.commonClass,
        appRoot: argv.appRoot,
        styleVariables: argv.styleVariables,
        server: argv.server,
        port: argv.port
      }))
      .pipe(gulp.dest(argv.output));
  });

  gulp.task('styleguide:applystyles', function() {
    return gulp.src(argv.styleSource)
      .pipe(styleguide.applyStyles())
      .pipe(gulp.dest(argv.output));
  });

  gulp.task('watch:kss', function() {
    return gulp.watch(argv.kssSource, ['styleguide:generate']);
  });

  gulp.task('watch:styles', function() {
    return gulp.watch(argv.styleSource, ['styleguide:applystyles']);
  });

  var tasks = ['styleguide:generate', 'styleguide:applystyles'];
  if (argv.watch) {
    tasks.push('watch:styles');
    tasks.push('watch:kss');
  }

  runSequence.apply(this, tasks);

};
