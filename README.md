# SC5 Styleguide generator

[![Build Status](https://travis-ci.org/SC5/sc5-styleguide.svg?branch=master)](https://travis-ci.org/SC5/sc5-styleguide)

Styleguide generator is a handy little tool that helps you generate good looking
styleguides from stylesheets using KSS notation. Styleguide generator can be
used from command line, gulp, etc. with minimal effort.

## How to use

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

### As a command line tool

Styleline command line tool searches all *.css, *.scss and *.less files from source directory and generates stand-alone styleguide to output path. You can host styleguide files yourself with any HTTP server or start built-in web server.

To install as a global command line tool

    npm install -g sc5-styleguide

How to use from command line

    styleguide -s <source_path> -o <output_path> [-c <config_file>] [--server] [--watch]

**-s, --source**

Source directory of stylesheets

**-o, --output**

Target directory of the generated styleguide

**-c, --config**

Optional JSON config file to be used when building the styleguide

**--server**

Start minimal web-server to host the styleguide from the output directory

**--port**

Port in which the server will run

**--watch**

Automatically generate styleguide on file change. --watch does not run server. Combile with --server if you want to run server


Config JSON file could contain following settings

    {
        "overviewPath": "<path to your overview.md>",
        "extraHead": [
            "<link rel=\"stylesheet\" type=\"text/css\" href=\"your/custom/style.css\">",
            "<script src=\"your/custom/script.js\"></script>"
        ]
    }

### As a module in your project

    npm install sc5-styleguide

To use in gulp

    var styleguide = require("sc5-styleguide");

    gulp.task("styleguide", function() {
      return gulp.src(["/**/*.css", "**/*.scss", "**/*.less"])
        .pipe(styleguide({
            overviewPath: "<path to your overview.md>",
            extraHead: [
                "<link rel=\"stylesheet\" type=\"text/css\" href=\"your/custom/style.css\">",
                "<script src=\"your/custom/script.js\"></script>"
            ],
            sass: {
                // Options passed to gulp-ruby-sass
            },
          }))
        .pipe(gulp.dest("<destination path>"));
    });

## Demo

Build demo styleguide and start a server

    gulp demo

Note: If you installed styleguide by cloning repository directly instead of npm you need to run `gulp build` first
You can change the default port (3000) with --port;

## How to develop

Projects contains small demo stylesheet that can be used to develop the UI.
Start watching UI changes in lib/app and build the app using the demo stylesheets:

    gulp watch --source ./demo/source --output ./demo/output --config ./demo/source/styleguide_config.json

Running the task also runs a small development server

### Running tests

    npm test

### Coding convention

This project follows AirBNB-ish JavaScript coding convention (with a few changes). It is tuned to use [JSCS]() as a code
checker. The checking is injected into the testing process, so you can see in Travis respond to your pull-request if your
files follow the convention.

To be able to check during development, please

* run `$ gulp jscs`
* use [JSCS editor plugins](https://github.com/jscs-dev/node-jscs#friendly-packages)
* use [pre-commit hook](https://github.com/SC5/sc5-configurations/blob/master/hooks/jscs-hook)
