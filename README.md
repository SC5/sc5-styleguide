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

    styleguide -s <source_path> -o <output_path> [-m <markdown_file>] [--server]


Param    | Description
---------|------------
-s       | Source directory of stylesheets
-o       | Target directory of the generated styleguide
-m       | Specify a Markdown file that is used as an overview page in your styleguide
--server | Start minimal web-server to host the styleguide from the target directory

### As a module in your project

    npm install git+https://github.com/SC5/sc5-styleguide.git

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

Start watching front-end changes in lib/app

    gulp watch

By default task watches stylesheet changes in demo/source and outputs results to demo/output
These defaults can be overridden with the following parameters:

    gulp styleguide --source <sourcedirectory> --output <outputdirectory>

Running the task also runs a small development server