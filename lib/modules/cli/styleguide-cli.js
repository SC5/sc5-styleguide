var path = require('path'),
  gulp = require('gulp'),
  runSequence = require('run-sequence');

module.exports = function(argv) {

  var styleguide = require(path.resolve(__dirname, '../../styleguide'));

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
