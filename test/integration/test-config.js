var path = require('path');

module.exports = {
  title: 'Test Styleguide',
  overviewPath: path.resolve(__dirname, '../projects/scss-project/source/test_overview.md'),
  appRoot: '/my-styleguide-book',
  extraHead: [
    '<link rel="stylesheet" type="text/css" href="your/custom/style.css">',
    '<script src="your/custom/script.js"></script>'
  ],
  commonClass: ['custom-class-1', 'custom-class-2'],
  styleVariables: path.resolve(__dirname, '../projects/scss-project/source/styles/_styleguide_variables.scss'),
  customColors: path.resolve(__dirname, '../projects/scss-project/source/styles/custom_colors.css'),
  filesConfig: []
};
