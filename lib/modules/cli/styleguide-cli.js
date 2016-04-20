var path = require('path'),
  gulp = require('gulp'),
  runSequence = require('run-sequence');

module.exports = function(argv) {

  function logError(err) {
    console.error(err);
  }

  try {

    var styleguide = require(path.resolve(__dirname, '../../styleguide')),
      tasks = ['styleguide:generate', 'styleguide:applystyles'];

    gulp.task('styleguide:generate', function() {
      console.log('Generating style guide to output dir:', argv.output);
      return gulp.src(argv.kssSource)
        .pipe(styleguide.generate({
          title: argv.title,
          rootPath: argv.output,
          extraHead: argv.extraHead,
          beforeBody: argv.beforeBody,
          afterBody: argv.afterBody,
          sideNav: argv.sideNav,
          commonClass: argv.commonClass,
          appRoot: argv.appRoot,
          styleVariables: argv.styleVariables,
          overviewPath: argv.overviewPath,
          server: argv.server,
          enableJade: argv.enableJade,
          port: argv.port,
          disableHtml5Mode: argv.disableHtml5Mode,
          customColors: argv.customColors,
          disableEncapsulation: argv.disableEncapsulation,
          filesConfig: argv.filesConfig
        }).on('error', logError))
        .pipe(gulp.dest(argv.output));
    });

    gulp.task('styleguide:applystyles', function() {
      return gulp.src(argv.styleSource)
        .pipe(styleguide.applyStyles().on('error', logError))
        .pipe(gulp.dest(argv.output));
    });

    gulp.task('watch:kss', function() {
      return gulp.watch(argv.kssSource, ['styleguide:generate']);
    });

    gulp.task('watch:styles', function() {
      return gulp.watch(argv.styleSource, ['styleguide:applystyles']);
    });

    if (argv.watch) {
      tasks.push('watch:styles');
      tasks.push('watch:kss');
    }

    runSequence.apply(this, tasks);

  } catch (err) {
    console.error('Style guide generation failed');
    logError(err);
  }

};
