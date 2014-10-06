# SC5 Styleguide generator

Styleguide generator is a handy little tool that helps you generate good looking
styleguides from stylesheets using KSS notation. Styleguide generator can be
used from command line, gulp, etc. with minimal effort.

## How to use

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

### As a command line tool

To install as a command line tool

    npm install git+https://github.com/SC5/sc5-styleguide.git

How to use from command line

    styleguide -s <source_path> -o <output_path> [-c <config_file>] [--server]


Param    | Description
---------|------------
-s       | Source directory of stylesheets
-o       | Target directory of the generated styleguide
-c       | JSON config file to be used when building the styleguide
--server | Start minimal web-server to host the styleguide from the target directory

### As a module in your project

    npm install git+https://github.com/SC5/sc5-styleguide.git

To use in gulp

    var styleguide = require("styleguide");

    gulp.task("styleguide", function() {
      return gulp.src(["**/*.scss"])
        .pipe(styleguide({
            outputPath: "<destination path>",
            overviewPath: "<path to your overview.md>"
            sass: {
                // options passed to gulp-ruby-sass
            },
          }));
    });

## How to develop

Projects contains small demo stylesheet that can be used to develop the UI.
Start watching UI changes in lib/app and build the UI using the demo stylesheets:

    gulp watch --source ./demo/source --output ./demo/output --config ./demo/source/styleguide_config.json

Running the task also runs a small development server