'use strict';

var gonzales = require('gonzales-pe');

module.exports = {

  /* Split string source into array of code and comment blocks */
  pureSplitter: function(source, syntax) {
    syntax = syntax || 'scss';
    var ast = gonzales.parse(source, {
          syntax: syntax
        }),
        sourceLines = source.split(/\n/),
        block,
        blocks = [],
        prevNode;

    ast.map(function(node) {
      var startNewBlock = function(position) {
        block && blocks.push(block);
        block = {
          type: '',
          position: position,
          content: ''
        };
      },
      type;
      if (node.type === 'stylesheet') {
        return;
      }
      // Calculate type of the current block
      // Multiline comment is comment
      if (node.type === 'commentML') {
        type = 'comment';
      }
      // Singleline comment is comment
      else if (node.type === 'commentSL') {
        type = 'comment';
      }
      // Single breaklines between singleline comments are comments
      else if (node.type === 's' && node.content.split('\n').length <= 2 && prevNode && prevNode.type === 'commentSL') {
        type = 'comment';
      }
      else {
        type = 'code';
      }
      // If type has been changed, start a new block
      if (!block || block.type !== type) {
        startNewBlock(node.start);
      }
      // Extend current block content
      block.type = type;
      prevNode = node;
    });
    // push last block
    if (block) {
      blocks.push(block);
    }
    // Fill blocks with content
    blocks.map(function(block, pos) {
      var from = block.position,
        to = blocks[pos + 1] ? blocks[pos + 1].position : {line: sourceLines.length, column: 1000000},
        content;
      // Get the code between given positions
      // Get the lines between given
      content = sourceLines.slice(from.line - 1, to.line);
      // Crop the first line
      content[0] = content[0].substr(from.column - 1);
      // Crop teh last line
      content[content.length - 1] = content[content.length - 1].substring(0, to.column - 1);
      block.content = content.join('\n');
    });
    return blocks;
  },
  getBlocks: function(source, syntax) {
    var blocks = this.pureSplitter(source, syntax),
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
