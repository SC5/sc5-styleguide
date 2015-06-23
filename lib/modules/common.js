'use strict';

var path = require('path');

function sanitizeOptions(opt) {
  return {
    title: opt.title || 'Styleguide Generator',
    sass: opt.sass || {},
    less: opt.less || {},
    css: opt.css || {},
    kssOpt: opt.kssOpt || {},
    overviewPath: opt.overviewPath || path.join(__dirname, '/overview.md'),
    extraHead: (typeof opt.extraHead === 'object') ? opt.extraHead.join('\n') : opt.extraHead,
    disableEncapsulation: opt.disableEncapsulation || false,
    disableHtml5Mode: opt.disableHtml5Mode || (typeof opt.disableHtml5Mode === 'undefined' && !opt.server) || false,
    appRoot: opt.appRoot || '',
    commonClass: opt.commonClass || '',
    styleVariables: opt.styleVariables || false,
    customColors: opt.customColors || false,
    server: opt.server || false,
    port: opt.port || 3000,
    rootPath: opt.rootPath,
    parsers: opt.parsers || {
      sass: 'scss',
      scss: 'scss',
      less: 'less',
      postcss: 'postcss'
    },
    filesConfig: opt.filesConfig
  };
}

module.exports = {
  sanitizeOptions: sanitizeOptions
};
