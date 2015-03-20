'use strict';

var marked = require('gulp-marked'),
  vfs = require('vinyl-fs'),
  excludeLinks = [
  'https://travis-ci.org/SC5/sc5-styleguide',
  'https://david-dm.org/SC5/sc5-styleguide'
  ];

function dasherize(str) {
  return str.replace(/\s/ig, '-').toLowerCase();
}

module.exports = {

  getStream: function(filePath) {
    var renderer = this.getRenderer();
    return vfs.src(filePath)
      .pipe(marked({renderer: renderer}));
  },

  getRenderer: function() {
    var renderer = {};
    // Define custom renderers for markup blocks
    renderer.heading = function(text, level) {
      return '<a name=' + dasherize(text) + '></a><h' + level + ' class="sg heading">' + text + '</h' + level + '>';
    };
    renderer.paragraph = function(text) {
      return '<p class="sg">' + text + '</p>';
    };
    renderer.listitem = function(text) {
      return '<li class="sg">' + text + '</li>\n';
    };
    renderer.link = function(href, title, text) {
      var out, prot;
      if (excludeLinks.indexOf(href) >= 0) {
        return '';
      }

      if (this.options.sanitize) {
        prot = '';
        try {
          prot = decodeURIComponent(href)
            .replace(/[^\w:]/g, '')
            .toLowerCase();
        } catch (e) {
          return '';
        }
        //jshint -W107
        if (prot.indexOf('javascript:') === 0) {
          return '';
        }
        //jshint +W107
      }
      out = '<a class="sg" href="' + href + '"';
      if (title) {
        out += ' title="' + title + '"';
      }
      out += '>' + text + '</a>';
      return out;
    };
    renderer.code = function(code, lang, escaped) {
      var out, htmlEscape = function(html, encode) {
        return html
          .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      if (this.options.highlight) {
        out = this.options.highlight(code, lang);
        if (out !== null && out !== code) {
          escaped = true;
          code = out;
        }
      }

      if (!lang) {
        return '<pre class="sg"><code>' +
          (escaped ? code : htmlEscape(code, true)) +
          '\n</code></pre>';
      }

      return '<pre class="sg"><code class="' +
        this.options.langPrefix +
        htmlEscape(lang, true) +
        '">' +
        (escaped ? code : htmlEscape(code, true)) +
        '\n</code></pre>\n';
    };
    return renderer;
  }

};
