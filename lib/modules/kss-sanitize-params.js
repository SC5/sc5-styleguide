'use strict';

module.exports = function(source) {

  var pass = true;

  source = source.split('\n').filter(function(line){

    var varName = line.match(/([\w\-]*):[\s]*$/);

    if (varName) {
      // Named parangraph begins

      if (varName[1].indexOf('sg-') === 0) {
        // This is a styleguide's named parameter

        pass = false;
        //console.log(varName[1], line);
      }
    }

    // When meets empty line, pass everything again
    var isEmptyLine = /^[\s\/]*$/.test(line);
    if (isEmptyLine) {
      pass = true;
    }

    return pass;

  }).join('\n');

  return source;
}
