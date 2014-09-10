# Styleguide generator

Styleguide generator is a handy little tool that helps you generate good looking
styleguides from stylesheets using KSS notation. Styleguide generator can be
used from command line, gulp, etc. with minimal effort.

## How to use

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

### As a command line tool

To install as a command line tool

    npm install -g git+ssh://bitbucket.org/SC5/styleguide.git

How to use from command line

    styleguide -s <sourcedirectory> -o <outputdirectory>

### As a module in your project

    npm install git+ssh://bitbucket.org/SC5/styleguide.git

To use in gulp

    gulp.task("styleguide", function() {
      return gulp.src(["./*.less"])
        .pipe(styleguide({
            dest: "styleguide/"
          }));
    });

## How to develop

To build and watch for frontend changes:

    gulp watch

The project does not currently include a development server of it's own. You can
host the directory of the generated development styleguide with the web server
of your choice.

For instance:

    php -S localhost:8080

or

    python -m SimpleHTTPServer 8080