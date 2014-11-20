var gulp = require('gulp'),
  gulpIgnore = require('gulp-ignore'),
  cssmin = require('gulp-cssmin'),
  rename = require("gulp-rename");

gulp.task('cssmin', function () {
  gulp.src('css/*.css')
    .pipe(gulpIgnore.exclude('*.min.css'))
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('css'));
});

gulp.task('watch', function() {
  gulp.watch('css/app.css', ['cssmin']);
});

gulp.task('default', ['cssmin']);
