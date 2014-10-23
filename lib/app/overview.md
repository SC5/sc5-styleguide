# Example styleguide

## About

This styleguide is generated using SC5 styleguide generator. Styleguide
generator aims to decrease time spent on developing living styleguides and
support styleguide driven development workflows.

### KSS

KSS (Knyle Style Sheets) is a documentation syntax for stylesheets
(CSS/LESS/SASS..). Used by the likes of [GitHub](https://github.com/styleguide/css)

Styleguide generator is largely based on KSS and kss-node projects.

    // Elements
    //
    // This section contains example documentation of different kinds of html
    // elements
    //
    // Styleguide 3.0

    // Buttons
    //
    // This section demonstrates the use of modifiers
    //
    // default - This is the default state of a button element
    // .green - This is a button with a class modifier
    // .red - This is another button with a class modifier
    // :hover - This is a button with the hover pseudo modifier
    //
    // Markup:
    // <button class="button {$modifiers}">Click me!</button>
    //
    // Styleguide 3.1

#### Improvements over kss-node
* UI built on Angular.js with search functionality
* Possibility to use SCSS variables as modifiers
* GitHub flavored Markdown for Overview
* Helper classes (for displaying colors etc.)
* In browser variable editing (experimental)
* A built-in server for hosting the styleguide and saving edited variables

### Github repository

https://github.com/SC5/sc5-styleguide

## Overview page

You can create an Overview page for your styleguide using Markdown,
check docs for more info.