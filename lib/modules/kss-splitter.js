'use strict'

var kssBlocksParser = require('./kss-blocks-parser').kssBlocksParser;

module.exports = {

  getAst: function(source) {
    var ast = kssBlocksParser.matchAll(source, 'any');
    return ast;
  }

}
