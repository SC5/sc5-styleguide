'use strict'

var kssBlocksParser = require('./kss-blocks-parser').kssBlocksParser;

module.exports = {

  /* Split string source into array of code and comment blocks */
  pureSplitter: function(source) {
    var lines = source.split(/\n|$/g),
      anInlineComment = / *\/\//,
      multilineCommentStarted = /\/~*/,
      multilineCommentFinished = /~*\//,
      isMultilineCommentStarted,
      blocks = [],
      block,
      type,
      prevType;

    lines.forEach(function(line){


      if (isMultilineCommentStarted) {
        type = 'comment'
        if (multilineCommentFinished.test(line)) {
          isMultilineCommentStarted = false;
        }
      } else {
        isMultilineCommentStarted = multilineCommentStarted.test(line);
        if (isMultilineCommentStarted) {
          type = 'comment'
        } else {
          type = anInlineComment.test(line)? 'comment' : 'code';
        }
      }

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
      pair = {
        kss: '',
        code: []
      },
      firstBlock = true,
      pairs = [],
      isKssMarkupBlock = /Styleguide [0-9]+/

    blocks.forEach(function(block){

      if (block.type == 'comment') {
        // Check if KSS
        if (isKssMarkupBlock.test(block.content)) {
          // Save old pair
          if (pair && !firstBlock) {
            pair.code = pair.code.join('');
            pairs.push(pair)
          }
          // KSS starts a new block
          pair = {
            kss: block.content,
            code: []
          }
        } else {
          // Not KSS comments are considered to be parts of code
          pair.code.push('\n')
          pair.code.push(block.content)
        }
      } else {
        pair.code.push('\n')
        pair.code.push(block.content)
      }

      firstBlock = false;

    });

    // Push last pair
    pair.code = pair.code.join('');
    pairs.push(pair);

    return pairs;
  }

}
