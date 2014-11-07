'use strict'

var kssBlocksParser = require('./kss-blocks-parser').kssBlocksParser;

module.exports = {

  getAst: function(source) {
    var ast = kssBlocksParser.matchAll(source, 'any');
    return ast;
  },
  getBlocks: function(source) {
    var ast = this.getAst(source),
      blocks = [];
    ast.forEach(function(token) {
      var kss, code;
      if (token[0] == 'block') {
        if (token[1][0] == 'kss') {
          kss = token[1][1]
        }
        if (token[2][0] == 'code') {
          code = token[2][1]
        }
      }
      blocks.push({
        kss: kss,
        code: code
      });
    });
    return blocks;
  }

}
