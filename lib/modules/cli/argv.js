var chalk = require('chalk');

module.exports = function(argLib) {
  return argLib
    .usage('Generate sc5-styleguide')
    .example('$0 --kssSource <source files> --styleSource <preprocessed CSS files> --output <dest>', 'Generate a styleguide')
    .demand('kssSource', chalk.red('Please provide sources of KSS files'))
    .demand('styleSource', chalk.red('Please provide sources of preprocessed files'))
    .demand('output', chalk.red('Please provide output path'))
    .describe('kssSource', 'KSS source file(s)')
    .describe('styleSource', 'Preprocessed styles')
    .describe('output', 'Output directory')
    .describe('enableJade', 'This bool use to enable Jade support, false by default')
    .describe('title', 'This string is used as a page title and in the page header')
    .describe('extraHead', 'These HTML elements are injected inside the style guide head-tag')
    .describe('beforeBody', 'These HTML elements are injected inside the style guide body tag, before any other content')
    .describe('afterBody', 'These HTML elements are injected inside the style guide body tag, after any other content')
    .describe('sideNav', 'This bool use to switch navigation to side nav')
    .describe('commonClass', 'The provided classes are added to all preview blocks in the generated style guide')
    .describe('appRoot', 'Define the appRoot parameter if you are hosting the style guide from a directory other than the root directory of the HTTP server')
    .describe('styleVariables', 'Specify the files to parse variable definitions from (defaults to all files/glob pattern passed to kssSource')
    .describe('server', 'Enable built-in web-server. To enable Designer tool the style guide must be served with the built-in web server')
    .describe('overviewPath', 'Overview file used as the generated style guide starting page. Parsed as Markdown.')
    .describe('port', 'Port of the server. Default is 3000')
    .describe('watch', 'Automatically generate styleguide on file change');
};
