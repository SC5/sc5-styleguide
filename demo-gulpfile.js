var gulp = require('gulp'),
  styleguide = require('./lib/styleguide'),
  source = 'lib/app/**/*.scss',
  outputPath = 'demo-output';

gulp.task('styleguide', ['static'], function() {
  return gulp.src(source)
    .pipe(styleguide({
        title: 'SC5 Styleguide',
        server: true,
        rootPath: outputPath,
        overviewPath: 'README.md',
        styleVariables: 'lib/app/sass/_styleguide_variables.scss',
        sass: {
          src: 'lib/app/sass/app.scss',
          includePaths: [
            'node_modules/node-bourbon/assets/stylesheets',
            'node_modules/node-neat/assets/stylesheets'
          ]
        },
        filesConfig: [
          {
            name: 'sgAppTest',
            files: [
              'demo/testDirective.js'
            ],
            template: 'demo/testDirective.html'
          }
        ]
      }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('static', function() {
  gulp.src(['lib/demo/**'])
    .pipe(gulp.dest(outputPath + '/demo'));
});

gulp.task('watch', ['styleguide'], function() {
  // Start watching changes and update styleguide whenever changes are detected
  gulp.watch(source, ['styleguide']);
});
