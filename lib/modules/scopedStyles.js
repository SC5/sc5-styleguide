var Q = require('q'),
    util = require('util'),
    less = require('less');

module.exports = {

  stylesFromString: function (string) {
    return Q.Promise(function(resolve, reject) {
      less.render(util.format('::content { %s }', string), function (e, result) {
        if (e) {
          return reject(e);
        }
        return resolve(result.css);
      });
    });
  }

};
