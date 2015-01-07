var gulp = require('gulp'),
  sass = require('gulp-sass'),
  styleguide = require('./lib/styleguide'),
  source = 'lib/app/**/*.scss',
  outputPath = 'demo-output';

gulp.task('styleguide:generate', function() {
  return gulp.src(source)
    .pipe(styleguide.generate({
        title: 'SC5 Styleguide',
        server: true,
        rootPath: outputPath,
        overviewPath: 'README.md',
        styleVariables: 'lib/app/sass/_styleguide_variables.scss'
      }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src('lib/app/sass/app.scss')
    .pipe(sass({
      includePaths: [
        'node_modules/node-bourbon/assets/stylesheets',
        'node_modules/node-neat/assets/stylesheets'
      ]
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide', ['styleguide:static', 'styleguide:generate', 'styleguide:applystyles']);

gulp.task('styleguide:static', function() {
  gulp.src(['lib/demo/**'])
    .pipe(gulp.dest(outputPath + '/demo'));
});

gulp.task('watch', ['styleguide'], function() {
  // Start watching changes and update styleguide whenever changes are detected
  gulp.watch(source, ['styleguide']);
});
