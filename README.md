# Styleguide generator

Styleguide generator is a handy little tool that helps you generate good looking
styleguides from stylesheets using KSS notation. Styleguide generator can be
used from command line, gulp, etc. with minimal effort.

## How to use

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

To install

    npm install git@bitbucket.org:SC5/styleguide.git

To use from CLI

    ./path_to_styleguide/bin/styleguide -s <srcdir> -o <outputdir>

To use in gulp

    gulp.task('styleguide', function() {
      return gulp.src(['./*.less'])
        .pipe(styleguide({
            dest: 'styleguide/'
          }));
    });

## How to develop

To build and watch for frontend changes:

    gulp watch