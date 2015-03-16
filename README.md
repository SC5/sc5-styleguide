# SC5 style guide generator
[![Build Status](https://travis-ci.org/SC5/sc5-styleguide.svg?branch=master)](https://travis-ci.org/SC5/sc5-styleguide) [![dependencies](https://david-dm.org/SC5/sc5-styleguide.png)](https://david-dm.org/SC5/sc5-styleguide)

Style guide generator is a handy little tool that helps you generate good looking style guides from style sheets
using KSS notation. It can be used as a command line utility, gulp task or grunt task (needs grunt-gulp) with minimal effort.

## Table of contents

* [Usage](#usage)
  * [As a command line tool](#as-a-command-line-tool)
  * [With gulp](#with-gulp)
  * [With grunt](#with-grunt)
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

Install plugin globally:

    npm install -g sc5-styleguide

Styleguide command line tool required two sets of source files:

`--kss-source`: Unprocessed files containing the KSS markup and LESS/SASS variables

`--style-source` Preprosessed/compiled stylesheets to be used in the styleguide

Example usage:

    styleguide --kss-source "sass/*.scss" --style-source "public/*.css" --output styleguide --watch --server

Other options parameters are defined in the [Build options](#build-options) section.

### With gulp

Install plugin locally:

    npm install sc5-styleguide --save-dev

The gulp plugin contains two functions that requires different set of file streams:

`generate()`: All unprocessed styles containing the KSS markup and style variables. This will process the KSS markup and collects variable information.

`applyStyles()`: Preprocessed/compiled stylesheets. This will create necessary pseudo styles and create the actual stylesheet to be used in the styleguide.

The following code shows complete example how to use styleguide with gulp-sass and with gulp watch.

    var styleguide = require('sc5-styleguide');
    var sass = require('gulp-sass');
    var outputPath = 'output';

    gulp.task('styleguide:generate', function() {
      return gulp.src('*.scss')
        .pipe(styleguide.generate({
            title: 'My Styleguide',
            server: true,
            rootPath: outputPath,
            overviewPath: 'README.md'
          }))
        .pipe(gulp.dest(outputPath));
    });

    gulp.task('styleguide:applystyles', function() {
      return gulp.src('main.scss')
        .pipe(sass({
          errLogToConsole: true
        }))
        .pipe(styleguide.applyStyles())
        .pipe(gulp.dest(outputPath));
    });

    gulp.task('watch', ['styleguide'], function() {
      // Start watching changes and update styleguide whenever changes are detected
      // Styleguide automatically detects existing server instance
      gulp.watch(['*.scss'], ['styleguide']);
    });

    gulp.task('styleguide', ['styleguide:generate', 'styleguide:applystyles']);

This approach gives flexibility to use any preprocessor. For example, you can freely replace gulp-sass with gulp-ruby-sass. However, please notice that variable parsing works only for SASS, SCSS and LESS files.

If you do not use preprocessor you can directly pipe CSS files to `applyStyles()`.

See [Build options](#build-options) section for complete documentation of different options.

### With grunt

Install the plugin first:

    npm install sc5-styleguide --save-dev

For Grunt-using projects you need also `grunt-gulp` bridge:

    npm install gulp --save-dev
    npm install grunt-gulp --save-dev

Then you are able to use the same gulp task inside you `Gruntfile`:

    var gulp = require('gulp'),
      styleguide = require('sc5-styleguide');

    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      gulp: {
        'styleguide-generate': function() {
          var outputPath = 'output';
          return gulp.src([''])
            .pipe(styleguide.generate({
                title: 'My Styleguide',
                server: true,
                rootPath: outputPath
              }))
            .pipe(gulp.dest(outputPath));
        },
        'styleguide-applystyles': function() {
          gulp.src('main.scss')
            .pipe(styleguide.applyStyles())
            .pipe(gulp.dest('output'));
        }
      },

      watch: {
        scss: {
          files: '**/*.scss',
          tasks: ['scss', 'gulp:styleguide-generate', 'gulp:styleguide-applystyles']
        }
      }
    });

    grunt.loadNpmTasks('grunt-gulp');

    grunt.registerTask('default', ['gulp:styleguide-generate', 'gulp:styleguide-applystyles', 'watch']);

When using Grunt, we recommend to process styles in grunt tasks as you do for your main application and pass
the resultant CSS into styleguide's gulp tasks.

For more specific documentation. See next section.

### Build options

CLI and gulp otpions accepts identically named parameters

<a name="option-title"></a>
**title** (string, optional)

This string is used as a page title and in the page header

<a name="option-extraHead"></a>
**extraHead** (array or string, optional)

These HTML elements are injected inside the style guide head-tag.

<a name="option-commonClass"></a>
**commonClass** (string or array of strings, optional)

The provided classes are added to all preview blocks in the generated style guide.
This option is useful if you have some namespace classes that should to be added to every block, but you do not want to add it to every example section's markup.

<a name="option-server"></a>
**server** (boolean, optional)

Enable built-in web-server. To enable Designer tool the style guide must be served with the built-in web server.
The server has also ability to refresh changed styles or KSS markup without doing a full page reload.

<a name="option-port"></a>
**port** (number, optional)

Port of the server. Default is 3000.

<a name="option-rootPath"></a>
**rootPath** (string, optional)

Server root path. This must be defined if you run the built-in server via gulp or grunt task.
Point to the same path as the style guide output folder.

Note: This option is not needed when running styleguide via the CLI.

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

### Defining an Angular directive

If your components can be rendered with Angular directives, you can define them in KSS markup and so avoid copy-pasting
in the `markup` field. This is how you can instruct the style guide to use Angular:

```
// Test directive
//
// markup:
// <div sg-test-directive>If you see this something is wrong</div>
//
// sg-angular-directive:
// name: NameOfMainAppModule
// template: path/to/template-filename.html
// file: path/to/application-file.js
//
// Styleguide 1.2.3
```

It is possible to define several files, so you can attach all the needed dependencies:

```
// sg-angular-directive:
// name: NameOfMainAppModule
// template: path/to/template-filename.html
// file: path/to/application-file.js
// file: path/to/dependency-file.js
// file: path/to/stylesheet.css
```

You can also write the same with comma-syntax

```
// sg-angular-directive:
// name: NameOfMainAppModule
// template: path/to/template-filename.html
// file: path/to/application-file.js, path/to/dependency-file.js, path/to/stylesheet.css
```

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

The changed values are checked for syntax errors before saving, and if something is wrong, nothing is written to the
source files and an error notification is shown on the client.

## Tips and pointers

### `<html>` and `<body>` styles

Since each component's markup is isolated from the application styles with Shadow DOM, styles defined in
`<html>` or `<body>` tags will not apply in the component previews. If you want to for example define a font that should
also be used in the component previews, define a css class with the font definitions and add that class to the
[commonClass configuration option](#option-commonClass).

## Demo

Build demo style guide and start a server on port 3000

    npm run demo

Note: If you installed style guide by cloning repository directly instead of npm you need to run `npm run build` first

The demo generates style guide to `demo-output` directory.

Point your browser to <http://localhost:3000>
