# SC5 style guide generator
[![Build Status](https://travis-ci.org/SC5/sc5-styleguide.svg?branch=master)](https://travis-ci.org/SC5/sc5-styleguide) [![dependencies](https://david-dm.org/SC5/sc5-styleguide.png)](https://david-dm.org/SC5/sc5-styleguide) [![npm version](https://badge.fury.io/js/sc5-styleguide.svg)](http://badge.fury.io/js/sc5-styleguide)


Style guide generator is a handy little tool that helps you generate good looking style guides from style sheets
using KSS notation. It can be used as a command line utility, gulp task or Grunt task (needs grunt-gulp) with minimal effort.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Usage](#usage)
  - [As a command line tool](#as-a-command-line-tool)
  - [With gulp](#with-gulp)
  - [With Grunt](#with-grunt)
  - [Build options](#build-options)
- [Documenting syntax](#documenting-syntax)
  - [Defining an Angular directive](#defining-an-angular-directive)
  - [Ignore parts of the stylesheet from being processed](#ignore-parts-of-the-stylesheet-from-being-processed)
  - [Wrapper markup](#wrapper-markup)
  - [Inserted markup](#inserted-markup)
  - [Jade markup](#jade-markup)
- [Designer tool](#designer-tool)
- [Images, fonts and other static assets](#images-fonts-and-other-static-assets)
- [Tips and pointers](#tips-and-pointers)
  - [`<html>` and `<body>` styles](#html-and-body-styles)
  - [Providing additional CSS](#providing-additional-css)
  - [Providing additional JavaScript](#providing-additional-javascript)
  - [onRendered event](#onrendered-event)
- [Demo](#demo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

You should familiarize yourself with both [KSS](https://github.com/kneath/kss)
and [node-kss](https://github.com/kss-node/kss-node) to get yourself started.

SC5 Style guide provides additions to KSS syntax which you can learn [below](#user-content-documenting-syntax).

### As a command line tool

Install plugin globally:

```bash
npm install -g sc5-styleguide
```

Styleguide command line tool required two sets of source files:

`--kss-source`: Unprocessed files containing the KSS markup and LESS/SASS variables

`--style-source` Preprosessed/compiled stylesheets to be used in the styleguide

Example usage:

```bash
styleguide --kss-source "sass/*.scss" --style-source "public/*.css" --output styleguide --watch --server
```

You need to either specify a single directory or you can specify one or more source directories with one or more --kss-source flags.

```bash
styleguide --kss-source "sass/*.scss" --kss-source "style/*.scss" --style-source "public/*.css" --output styleguide --watch --server
```

Other options parameters are defined in the [Build options](#build-options) section.

### With gulp

Install plugin locally:

```bash
npm install sc5-styleguide --save-dev
```

The gulp plugin contains two functions that requires different set of file streams:

`generate()`: All unprocessed styles containing the KSS markup and style variables. This will process the KSS markup and collects variable information.

`applyStyles()`: Preprocessed/compiled stylesheets. This will create necessary pseudo styles and create the actual stylesheet to be used in the styleguide.

The following code shows complete example how to use styleguide with gulp-sass and with gulp watch.

```js
var gulp = require('gulp');
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
```

This approach gives flexibility to use any preprocessor. For example, you can freely replace gulp-sass with gulp-ruby-sass. However, please notice that variable parsing works only for SASS, SCSS and LESS files.

If you do not use preprocessor you can directly pipe CSS files to `applyStyles()`.

See [Build options](#build-options) section for complete documentation of different options.

### With Grunt

For projects using Grunt, install the plugin, gulp and the `grunt-gulp` bridge.

```bash
npm install sc5-styleguide gulp grunt-gulp --save-dev
```

Then you are able to use the same gulp task inside you `Gruntfile`:

```js
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
            rootPath: outputPath,
            overviewPath: 'README.md'
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
```

When using Grunt, we recommend processing styles in Grunt tasks as you do for your main application and pass
the resultant CSS into styleguide's gulp tasks.

For more specific documentation see the next section.

### Build options

CLI and gulp options accepts identically named parameters

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

Server root path. This must be defined if you run the built-in server via gulp or Grunt task.
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

<a name="option-disableEncapsulation"></a>
**disableEncapsulation** (boolean, optional, default: false)

Disable Shadow DOM encapsulation. When this option parameter is enabled, all styles are defined in page head and markup examples are not encapsulated using Shadow DOM.

<a name="option-disableHtml5Mode"></a>
**disableHtml5Mode** (boolean, optional, default: false)

Disable HTML5 URL mode. When this option parameter is enabled, style guide will use hashbang URLs instead of HTML5 history API. This is useful when hosting static style guides.

<a name="option-basicAuth"></a>
**basicAuth** (object, optional, default: null)

Protect server with basic HTTP authentication.

```js
basicAuth: {
  username: 'username',
  password: 'password'
}
```

<a name="option-readOnly"></a>
**readOnly** (boolean, optional, default: false)

Disable variable saving from web interface.

<a name="option-customColors"></a>
**customColors** (string, optional)

Path to file that defines custom UI color overrides using SASS variables. See all possible variables [here](https://github.com/SC5/sc5-styleguide/blob/master/lib/app/sass/_styleguide_variables.scss).

The directory of of customColors file is included to SASS `includePaths` so it is possible to `@import` also external stylesheets.

Internal styles could be overriden by defining new styles inside the `styleguide_custom_styles` mixin. This mixin is added to the end of the application stylesheet.

<a name="option-parsers"></a>
**parsers** (object, optional)

default:

```js
parsers: {
  sass: 'scss',
  scss: 'scss',
  less: 'less',
  postcss: 'postcss'
}
```

Styleguide tries to guess which parser to use when parsing variable information from stylesheets. The object key defines the file extension to match and the value refers to the parser name. There are three parsers available: `scss`, `less` and `postcss`.

For example, to parse all .css files using postcss parser, following configuration could be used:

```js
{
  css: 'postcss'
}
```

<a name="option-filesConfig"></a>
**filesConfig** (array, optional) **(Experimental feature)**

All HTML markup sections defined in the KSS block is dynamically compiled inside the styleguide thus it is possibly to use Angular directive inside the markup. These external directives are lazy loaded in the styleguide Angular application. `filesConfig` configuration parameter could be used to define lazy loaded files. Files are only required, not copied automatically. You need make sure that files are copied inside the styleguide output directory when generating the styleguilde.

Configuration array containing paths to the dependencies of the hosted application

```js
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
```

Note: When using templateUrl in directives, the template path is relative to style guide index.html, not the hosted application root.

## Documenting syntax

Document your CSS components with [KSS](http://warpspire.com/kss/)

### Defining an Angular directive

If your components can be rendered with Angular directives, you can define them in KSS markup and so avoid copy-pasting
in the `markup` field. This is how you can instruct the style guide to use Angular:

```js
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

```js
// sg-angular-directive:
// name: NameOfMainAppModule
// template: path/to/template-filename.html
// file: path/to/application-file.js
// file: path/to/dependency-file.js
// file: path/to/stylesheet.css
```

You can also write the same with comma-syntax

```js
// sg-angular-directive:
// name: NameOfMainAppModule
// template: path/to/template-filename.html
// file: path/to/application-file.js, path/to/dependency-file.js, path/to/stylesheet.css
```

### Ignore parts of the stylesheet from being processed

You can ignore parts of the CSS or KSS from being processed using the following tags:

```js
// styleguide:ignore:start
Ignored styles
// styleguide:ignore:end
```

### Wrapper markup

Sometimes your component examples need a wrapper. For example:
* you need to show how to use `<li>` element which works only with `<ul>` container;
* your component is not visible with white background;
* your component needs a container with a predefined height.

You can cover such cases by adding a wrapper to a component markup. The wrapper should be defined as a custom parameter
in the KSS documentation block:

```js
// markup:
// <li>
//   <a class="{$modifiers}">Item</a>
// </li>
//
// sg-wrapper:
// <nav class="sg side-nav">
//   <ul>
//     <sg-wrapper-content/>
//   </ul>
// </nav>
```

The `<sg-wrapper-content/>`
inside shows where to place an example.

Wrappers can be used for fixes like this:

```js
// markup:
// <div class="my-component">This is a white component</div>
//
// sg-wrapper:
// <div style="background-color: grey;">
//   <sg-wrapper-content/>
// </div>
```

The modifiers get the same wrapper as their parent section.

**Wrappers are inheritable.** A wrapper of a parent section is inherited by its children sections. This means that the
following KSS markup

```js
// Parent section
//
// markup:
// <div class="parent"></div>
//
// sg-wrapper:
// <div class="parent-wrapper">
//   <sg-wrapper-content/>
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
//   <sg-wrapper-content/>
// </div>
//
// Styleguide 1.1
```

would produce a Parent section:

```html
<div class="parent-wrapper">
  <div class="parent"></div>
</div>
```

and a Child section:

```html
<div class="parent-wrapper">
  <div class="parent">
    <span class="child"></span>
  </div>
</div>
```

### Inserted markup

In the markup you can insert markup of the other sections by referring to its section number. The markup of the referred section will be inserted into the current one. You can also target specific modifiers or include all modifiers. All unknown `{$modifiers}` will be ignored. Nested insert also works.

```js
// List
//
// markup:
// <ul>
//   <sg-insert>1.2.1</sg-insert>
//   <sg-insert>1.2.1-5</sg-insert> to insert the 5th modifier of 1.2.1
//   <sg-insert>1.2.1-all</sg-insert> to insert all modifiers of 1.2.1
// </ul>
//
// Styleguide 1.2

...

// List item
//
// markup:
// <li>Item<li>
//
// Styleguide 1.2.1
```

At the generated website the markup is shown expanded.

### Jade markup with BEM support (kizu/bemto).

```js
...
//
// markup:
// +b.block_modifier(class="{$modifiers}")
//   +e.element
//

## Designer tool

Designer tool is a feature that allows editing style variable directly in the browser and saving the changes back
to the source file. It is enabled when the [styleVariables option](#option-styleVariables) is defined and
the application is served with the [built-in server](#option-server).

The changed values are checked for syntax errors before saving, and if something is wrong, nothing is written to the
source files and an error notification is shown on the client.

## Images, fonts and other static assets

Images, fonts and other static assets should be copied to style guide output folder to make them accessible in the style guide. It is recommended to create a gulp or Grunt task to do the copying always when the style guide is generated.

If you modify you assets in gulp streams, you can add styleguide output directory as a second destination for your assets:

```js
gulp.task('images', function() {
  gulp.src(['images/**'])
    // Do image sprites, optimizations etc.
    .pipe(gulp.dest(buildPath + '/images'))
    .pipe(gulp.dest(outputPath + '/images'));
});
```

## Tips and pointers

### `<html>` and `<body>` styles

Since each component's markup is isolated from the application styles with Shadow DOM, styles defined in
`<html>` or `<body>` tags will not apply in the component previews. If you want to for example define a font that should
also be used in the component previews, define a css class with the font definitions and add that class to the
[commonClass configuration option](#option-commonClass).

### Providing additional CSS

Sometimes it is needed to apply additional CSS to the components. For example, make grid items of different colors so
that they could be easily seen. But such CSS should not sit together with the basic CSS of the component because it is
not supposed to be used in general. Obvious solution is to provide additional CSS which works in the styleguide only.

As the Styleguide shows the components isolated with Shadow DOM, any additional CSS provided with `extraHead` option
will not affect the components. If you want to provide additional CSS which affects the components, this code
should be added to the other styles when building:

```js
var concat = require("gulp-concat");

...

gulp.task('styleguide:applystyles', function() {
  return gulp.src([
      'main.scss'
      'utils/additional.scss'
      ])
    .pipe(concat('all.scss'))
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(styleguide.applyStyles())
    .pipe(gulp.dest(outputPath));
});
```

### Providing additional JavaScript

To provide additional JavaScript for the StyleGuide pages, define its `<script>` tas in the `extraHead` parameter:

```js
gulp.task('styleguide:generate', function() {
  return gulp.src('*.scss')
    .pipe(styleguide.generate({
        ...
        extraHead: [
          '<script src="/path/to/my-js-file.js"></script>'
        ],
        disableEncapsulation: true
        ...
      }))
    .pipe(gulp.dest(outputPath));
});
```

Include other needed scripts, such as libraries, into the same array:

```js
extraHead: [
  '<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>',
  '<script src="/path/to/my-js-file.js"></script>'
]
```

This way you can enrich the documented components with JavaScript. Keep in mind that you need to use `disableEncapsulation` parameter to make the components visible for the parent page JavaScript (otherwise they are encapsulated with shadowDOM).

### onRendered event

The components get visible onto the StyleGuide pages dynamically. This means that it takes some time to render them.

In your JavaScript you need to operate components after they had been rendered. Catch `styleguide:onRendered` event on `window` for that:

```js
$(window).bind("styleguide:onRendered", function(e) {
  // do anything here
  // use e.originalEvent.detail.elements to get elements
});
```

This is useful when you need to initialize your components. As this kind of initializing is only needed on the StyleGuide pages, you can provide it with an additional file:

```js
extraHead: [
  '<script src="/path/to/my-js-file.js"></script>',
  '<script src="/js/init-styleguide.js"></script>'
]
```

## Demo

Build demo style guide and start a server on port 3000

```bash
npm run demo
```

Note: If you installed style guide by cloning repository directly instead of npm you need to run `npm run build` first

The demo generates style guide to `demo-output` directory.

Point your browser to <http://localhost:3000>
