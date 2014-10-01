# SC5 Styleguide generator

Styleguide generator is a handy little tool that helps you generate good looking
styleguides from stylesheets using KSS notation. Styleguide generator can be
used from command line, gulp, etc. with minimal effort.

## How to use

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

### As a command line tool

To install as a command line tool

    git clone git+https://github.com/SC5/sc5-styleguide.git
    cd sc5-styleguide
    npm install

How to use from command line

    styleguide -s <sourcedirectory> -o <outputdirectory>

You can specify a Markdown file that is used as an overview page in your
styleguide using -m

    styleguide -s <sourcedirectory> -o <outputdirectory> -m <overviewfile.md>

### As a module in your project

    npm install git+https://github.com/SC5/sc5-style-guide.git

To use in gulp

    var styleguide = require("styleguide");
    
    gulp.task("styleguide", function() {
      return gulp.src(["**/*.scss"])
        .pipe(styleguide({
            dest: "<destination path>",
            sass: {
                // options passed to gulp-ruby-sass
            },
            markdownPath: "<path to your overview.md>"
          }));
    });

## How to develop

To build and watch for frontend changes:

    gulp watch

Running the watch task also runs a small development server
