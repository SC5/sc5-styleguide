'use strict'

var kssBlocksParser = require('./kss-blocks-parser').kssBlocksParser;

module.exports = {

  /* Split string source into array of code and comment blocks */
  pureSplitter: function(source) {
    var lines = source.split(/\n|$/g),
      isAnInlineComment = / *\/\//,
      blocks = [],
      block,
      prevType;

    lines.forEach(function(line){

      var type = isAnInlineComment.test(line)? 'comment' : 'code';

      if (prevType != type) {
        // Save old block if a new type appears
        if (block) {
          block.content = block.content.join('\n');
          blocks.push(block);
        }
        // Start a new block after changing the type
        block = {
          type: type,
          content: [line]
        }
      } else {
        block.content.push(line);
      }

      prevType = type;

    });

    // Push the last block
    block.content = block.content.join('\n');
    blocks.push(block);

    return blocks;
  },

  getBlocks: function(source) {

    var blocks = this.pureSplitter(source),
      pair,
      pairs = [],
      isKssMarkupBlock = /Styleguide [0-9]+/

    blocks.forEach(function(block){

      if (block.type == 'comment') {
        // Check if KSS
        if (isKssMarkupBlock.test(block.content)) {
          // Save old pair
          if (pair) {
            pair.code = pair.code.join('');
            pairs.push(pair)
          }
          // KSS starts a new block
          pair = {
            kss: block.content,
            code: []
          }
        }
      } else {
        pair.code.push(block.content)
      }

    });

    // Push last pair
    pair.code = pair.code.join('');
    pairs.push(pair);

    return pairs;
  }

}
