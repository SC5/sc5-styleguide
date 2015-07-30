'use strict';

var gonzales = require('gonzales-pe'),
    traverser = require('./ast-traverser'),
    ignoreBlock = require('./ignore-block');

module.exports = {

  /* Split string source into array of code and comment blocks */
  pureSplitter: function(source, syntax) {
    syntax = syntax || 'scss';
    source = ignoreBlock.removeIgnoredBlocks(source);


    var ast = gonzales.parse(source, {
          syntax: syntax
        }),
        block,
        blocks = [],
        prevNode;

    traverser.traverse(ast, [{
      // Visitor for SASS and SCSS syntaxes
      test: function(name) {
        return name !== 'stylesheet';
      },
      process: function(nodes) {
        var startNewBlock = function(position) {
          block && blocks.push(block);
          block = {
            type: '',
            position: position,
            content: ''
          };
        },
        type;
        // Calculate type of the current block
        // Multiline comment is comment
        if (nodes.type === 'multilineComment') {
          type = 'comment';
        }
        // Singleline comment is comment
        else if (nodes.type === 'singlelineComment') {
          type = 'comment';
        }
        // Single breaklines between singleline comments are comments
        else if (nodes.type === 'space' && nodes.content.split('\n').length <= 2 && prevNode && prevNode.type === 'singlelineComment') {
          type = 'comment';
        }
        else {
          type = 'code';
        }

        if (!block || block.type !== type) {
          startNewBlock(nodes.start);
        }
        // Extend current block content
        block.type = type;
        block.content += nodes.toString(syntax);
        prevNode = nodes;
      }
    }]);
    // push last block
    if (block) {
      blocks.push(block);
    }
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
