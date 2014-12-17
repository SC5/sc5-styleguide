# SC5 style guide generator
[![Build Status](https://travis-ci.org/SC5/sc5-styleguide.svg?branch=master)](https://travis-ci.org/SC5/sc5-styleguide) [![dependencies](https://david-dm.org/SC5/sc5-styleguide.png)](https://david-dm.org/SC5/sc5-styleguide)

Style guide generator is a handy little tool that helps you generate good looking style guides from style sheets
using KSS notation. It can be used as a command line utility, gulp task or grunt task (needs grunt-gulp) with minimal effort.

## Table of contents

* [Usage](#usage)
  * [As a command line tool](#as-a-command-line-tool)
  * [As a module in your project](#as-a-module-in-your-project)
  * [With Gulp](#with-gulp)
  * [With Grunt](#with-grunt)
  * [Build options](#build-options)
* [Documenting syntax](#documenting-syntax)
  * [Wrapper markup](#wrapper-markup)
* [Designer tool](#designer-tool)
* [Tips and pointers](#tips-and-pointers)
* [Demo](#demo)

## Usage

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

SC5 Style guide provides additions to KSS syntax which you can learn [below](#user-content-documenting-syntax).

### As a command line tool

Styleline command line tool searches all \*.css, \*.scss and \*.less files from source directory and generates
a stand-alone style guide to output path. You can host the style guide files yourself with any HTTP server,
or use the built-in web server.

Installing as a global command line tool

    npm install -g sc5-styleguide

Using from the command line

    styleguide -s <source_path> -o <output_path> [-c <config_file>] [--server] [--watch]

**-s, --source**

Source directory of style sheets or path to a single file

**-o, --output**

Target directory of the generated style guide

**-c, --config**

Optional JSON config file to be used when building the style guide

**--server**

Start minimal web-server to host the style guide from the output directory

**--port**

Port in which the server will run

**--watch**

Automatically generate style guide on file change. `--watch` does not run server. Combile with `--server` if you want to run server


Config JSON file could look like following:

    {
        title: "My Style guide",
        "overviewPath": "<path to your overview.md>",
        "extraHead": [
            "<link rel=\"stylesheet\" type=\"text/css\" href=\"your/external/fonts/etc.css\">",
            "<script src=\"your/custom/script.js\"></script>"
        ],
          sass: {
            src: 'customSassSrc.sass'
            // Other options passed to gulp-sass
          },
          less: {
            src: 'customLessSrc.less'
            // Other options passed to gulp-less
          }
    }

For more specific documentation. See [Build options](#build-options) section.

### As a module in your project

    npm install sc5-styleguide --save-dev

### With Gulp

    var styleguide = require("sc5-styleguide");

    gulp.task("styleguide", function() {
      var outputPath = '<destination folder>';

      return gulp.src(["**/*.css", "**/*.scss", "**/*.less"])
        .pipe(styleguide({
            title: "My Styleguide",
            server: true,
            rootPath: outputPath,
            overviewPath: "<path to your overview.md>",
            sass: {
                // Options passed to gulp-sass
            },
            less: {
                // Options passed to gulp-less
            }
          }))
        .pipe(gulp.dest(outputPath));
    });

    gulp.task("styleguide-watch", ["styleguide"], function() {
      // Start watching changes and update styleguide whenever changes are detected
      // Styleguide automatically detects existing server instance
      gulp.watch(["**/*.css", "**/*.scss", "**/*.less"], ["styleguide"]);
    });

For more specific documentation. See [Build options](#build-options) section.

### With Grunt

For Grunt-using projects you need to use `grunt-gulp` bridge:

    npm install grunt-gulp --save-dev

Then you are able to use the same gulp task inside you `Gruntfile`:

    var gulp = require('gulp'),
      styleguide = require('sc5-styleguide');

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      gulp: {
        styleguide: function() {
          var outputPath = '<destination folder>';
          return gulp.src(["**/*.css", "**/*.scss", "**/*.less"])
            .pipe(styleguide({
                title: "My Styleguide",
                server: true,
                rootPath: outputPath,
                overviewPath: "<path to your overview.md>",
                sass: {
                    // Options passed to gulp-sass
                },
                less: {
                    // Options passed to gulp-less
                }
              }))
            .pipe(gulp.dest(outputPath));
        }
      }
    });

    grunt.loadNpmTasks('grunt-gulp');

    grunt.registerTask('default', ['gulp']);

For more specific documentation. See next section.

### Build options

The gulp function and configuration JSON accepts identically named parameters

<a name="option-title"></a>
**title** (string, optional)

This string is used as a page title and in the page header

<a name="option-extraHead"></a>
**extraHead** (array or string, optional)

These HTML elements are injected inside the style guide head-tag.

<a name="option-sass"></a>
**sass** (object, optional)

Options passed to gulp-sass.
Use `sass.src` to define which files are passed to the sass compiler.
By default the gulp.src'ed files are filtered with `**/*.scss`.

<a name="option-less"></a>
**less** (object, optional)

Options passed to gulp-less.
Use `less.src` to define which files are passed to the less compiler.
By default the gulp.src'ed files are filtered with `**/*.less`.

<a name="option-css"></a>
**css** (object, optional)

Use `css.src` to define which css files will be included with the sass and less files.
By default the gulp.src'ed files are filtered with `**/*.css`.

<a name="option-commonClass"></a>
**commonClass** (string or array of strings, optional)

The provided classes are added to all preview blocks in the generated style guide.
This option is useful if you have some namespace classes that should to be added to every block, but you do not want to add it to every example section's markup.

<a name="option-server"></a>
**server** (boolean, optional)

Enable built-in web-server. To enable Desiger tool the style guide must be served with the built-in web server.
The server has also ability to refresh changed styles or KSS markup without doing a full page reload.

<a name="option-port"></a>
**port** (number, optional)

Port of the server. Default is 3000.

<a name="option-rootPath"></a>
**rootPath** (string, optional)

Server root path. This must be defined if you run the built-in server via gulp or grunt task.
Point to the same path as the style guide output folder.

<a name="option-appRoot"></a>
**appRoot** (string, optional)

Define the `appRoot` parameter if you are hosting the style guide from a directory other than the root directory of
the HTTP server. If the style guide is hosted at `http://example.com/styleguide` the appRoot should be `styleguide`.

When using the build as a subdirectory of your application, tune your server to resolve all the paths to that subdirectory.
This allows Angular to deal with the routing. However, the static files should be resolved as they are stored.

<a name="option-styleVariables"></a>
**styleVariables** (string, optional)

By default variable definitions are searched from every file passed in gulp.src. styleVariables parameter could be used to filter from which files variables are loaded.

<a name="option-filesConfig"></a>
**filesConfig** (array, optional) **(Experimental feature)**

All HTML markup sections defined in the KSS block is dynamically compiled inside the styleguide thus it is possibly to use Angular directive inside the markup. These external directives are lazy loaded in the styleguide Angular application. `filesConfig` configuration parameter could be used to define lazy loaded files. Files are only required, not copied automatically. You need make sure that files are copied inside the styleguide output directory when generating the styleguilde.

Configuration array containing paths to the dependencies of the hosted application

    filesConfig: [
      {
        "name": "NameOfMainAppModule",
        "files": [
          "path/to/dependency-file.js",
          "path/to/application-file.js",
          "path/to/stylesheet.css",
        ],
        "template": "path/to/template-filename.html"
      }
    ]

Note: When using templateUrl in directives, the template path is relative to style guide index.html, not the hosted application root.

## Documenting syntax

Document your CSS components with [KSS](http://warpspire.com/kss/)

### Wrapper markup

Sometimes your component examples need a wrapper. For example:
* you need to show how to use `<li>` element which works only with `<ul>` container;
* your component is not visible with white background;
* your comnponent needs a container with a predefined height.

You can cover such cases by adding a wrapper to a component markup. The wrapper should be defined as a custom parmater
in the KSS documentation block:

```
// markup:
//  <li>
//    <a class="{$modifiers}">Item</a>
//  </li>
//
// sg-wrapper:
// <nav class="sg side-nav">
//  <ul>
//   <sg-wrapper-content/>
//  </ul>
// </nav>
```

The `<sg-wrapper-content/>`
inside shows where to place an example.

Wrappers can be used for fixes like this:

```
// markup:
//  <div class="my-component">This is a white component</div>
//
// sg-wrapper:
// <div style="background-color: grey;">
//   <sg-wrapper-content/>
// </div>
```

The modifiers get the same wrapper as their parent section.

**Wrappers are inheritable.** A wrapper of a parent section is inherited by its children sections. This means that the
following KSS markup

```
// Parent section
//
// markup:
// <div class="parent"></div>
//
// sg-wrapper:
// <div class="parent-wrapper">
//  <sg-wrapper-content/>
// </div>
//
// Styleguide 1.0

...

// Child section
//
// markup:
// <span class="child"></span>
//
// sg-wrapper:
// <div class="parent">
//  <sg-wrapper-content/>
// </div>
//
// Styleguide 1.1
```

would produce a Parent section:
 ```
<div class="parent-wrapper">
  <div class="parent"></div>
</div>
```
and a Child section:
```
<div class="parent-wrapper">
  <div class="parent">
    <span class="child"></span>
  </div>
</div>
```

## Designer tool

Designer tool is a feature that allows editing style variable directly in the browser and saving the changes back
to the source file. It is enabled when the [styleVariables option](#option-styleVariables) is defined and
the application is served with the [built-in server](#option-server).

## Tips and pointers

### `<html>` and `<body>` styles

Since each component's markup is isolated from the application styles with Shadow DOM, styles defined in
`<html>` or `<body>` tags will not apply in the component previews. If you want to for example define a font that should
also be used in the component previews, define a css class with the font definitions and add that class to the
[commonClass configuration option](#option-commonClass).

### How to exclude styles from styleguide

All gulp src streams passed to the styleguide generator goes trought the flow that is much slower than normal style preprocessing. This could induce performance issues. If you have vendor styles in a subfolder, it is recommended to exclude them from build and pass only files that contains KSS markup as a gulp source stream. Use gulp `!` source syntax and declare the main source file as `sass` (or `less`) `src` option:

    var styleguide = require("sc5-styleguide");

    gulp.task("styleguide", function() {
      return gulp.src([
        "styles/**/*.less",
        "!styles/bootsrap/**"
        ]).pipe(styleguide({

          ...

          sass: {
              src: '<main SASS file>'
          },
          less: {
              src: '<main LESS file>'
          }
        ))
    });

## Demo

Build demo style guide and start a server on port 3000

    npm run demo

Note: If you installed style guide by cloning repository directly instead of npm you need to run `npm run build` first

The demo generates style guide to `demo-output` directory.

Point your browser to <http://localhost:3000>
