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
    beforeBody: (typeof opt.beforeBody === 'object') ? opt.beforeBody.join('\n') : opt.beforeBody,
    afterBody: (typeof opt.afterBody === 'object') ? opt.afterBody.join('\n') : opt.afterBody,
    afterSections: (typeof opt.afterSections === 'object') ? opt.afterSections.join('\n') : opt.afterSections,
    additionalNgDependencies: opt.additionalNgDependencies || false,
    sideNav: opt.sideNav || false,
    showReferenceNumbers: opt.showReferenceNumbers || false,
    showMarkupSection: opt.showMarkupSection || false,
    hideSubsectionsOnMainSection: opt.hideSubsectionsOnMainSection || false, 
    disableEncapsulation: opt.disableEncapsulation || false,
    disableHtml5Mode: opt.disableHtml5Mode || (typeof opt.disableHtml5Mode === 'undefined' && !opt.server) || false,
    appRoot: opt.appRoot || '',
    commonClass: opt.commonClass || '',
    styleVariables: opt.styleVariables || false,
    customColors: opt.customColors || false,
    favIcon: opt.favIcon || false,
    server: opt.server || false,
    port: opt.port || 3000,
    disableServerLog: opt.disableServerLog || false,
    basicAuth: opt.basicAuth || null,
    rootPath: opt.rootPath,
    readOnly: opt.readOnly || false,
    includeDefaultStyles: opt.includeDefaultStyles === false ? false : true,
    parsers: opt.parsers || {
      sass: 'sass',
      scss: 'scss',
      less: 'less',
      postcss: 'postcss'
    },
    filesConfig: opt.filesConfig,
    styleguideProcessors: opt.styleguideProcessors || {}
  };
}

module.exports = {
  sanitizeOptions: sanitizeOptions
};
