var gulp = require('gulp'),
  styleguide = require('./lib/styleguide'),
  postcss = require('gulp-postcss'),
  rename = require('gulp-rename'),
  source = 'lib/app/css/*.css',
  outputPath = 'demo-output';

gulp.task('styleguide:generate', function() {
  return gulp.src(source)
    .pipe(styleguide.generate({
        title: 'SC5 Styleguide',
        server: true,
        rootPath: outputPath,
        overviewPath: 'README.md',
        styleVariables: 'lib/app/css/_styleguide_variables.css',
        parsers: {
          css: 'postcss'
        },
        styleguideProcessors: {
            40: function(styleguide) {
                styleguide.sections[0].description = styleguide.sections[0].description + ' [Description from custom Processor]';
            }
        }
      }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('styleguide:applystyles', function() {
  return gulp.src('lib/app/css/styleguide-app.css')
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
    .pipe(rename('styleguide-app.css'))
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
