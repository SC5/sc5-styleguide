'use strict';

var postcssParser = require('./parsers/postcss'),
    scssParser = require('./parsers/scss'),
    ignoreBlock = require('./ignore-block');

module.exports = {

  /* Split string source into array of code and comment blocks */
  pureSplitter: function(source, syntax, parser) {
    syntax = syntax || 'scss';
    source = ignoreBlock.removeIgnoredBlocks(source);

    var blocks;
    if (parser === 'postcss') {
      blocks = postcssParser.splitCodeAndCommentBlocks(source);
    } else {
      // Suits all the syntaxes
      blocks = scssParser.splitCodeAndCommentBlocks(source, syntax);
    }
    return blocks;
  },

  getBlocks: function(source, syntax, parser) {
    var blocks = this.pureSplitter(source, syntax, parser),
      pair = {
        kss: '',
        code: []
      },
      firstBlock = true,
      pairs = [],
      isKssMarkupBlock = /Styleguide [0-9]+/;

    blocks.forEach(function(block) {
      if (block.type === 'comment') {
        // Check if KSS
        if (isKssMarkupBlock.test(block.content)) {
          // Save old pair
          if (pair && !firstBlock) {
            pair.code = pair.code.join('');
            pairs.push(pair);
          }
          // KSS starts a new block
          pair = {
            kss: block.content,
            code: []
          };
        } else {
          // Not KSS comments are considered to be parts of code
          pair.code.push(block.content);
        }
      } else {
        pair.code.push(block.content);
      }

      firstBlock = false;

    });

    // Push last pair
    pair.code = pair.code.join('');
    pairs.push(pair);

    return pairs;
  }

};
