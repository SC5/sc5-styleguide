# Styleguide generator

Generates a styleguide from KSS notated stylesheets.

## How to use

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

To install

    todo

To use in gulp

    gulp.task('styleguide', function() {
      return gulp.src(['./*.less'])
        .pipe(styleguide());
    });

## How to develop

To build and watch for frontend changes:

    gulp watch