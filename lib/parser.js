module.exports = function() {
  var parseVariables,
      gonzales = require('gonzales-pe');

  // Parse SASS variables to object
  parseVariables = function(string) {

    var ast = gonzales.srcToAST({
      src: string,
      syntax: 'sass'
    });

    var out = {},
      re = /\$(.*?)\;/g,
      match,
      varParts;
    while (match = re.exec(string)) {
      varParts = match[1].match(/(.*)\:(.*)/);
      if (varParts) {
        out[varParts[1]] = varParts[2].trim();
      }
    }
    return out;
  }

  // Modifies string so that variables passed in object are updated
  setVariables = function(string, variables) {
    var sorted = [], lines = [];
    // TODO: This is temporary solution that just re-generates whole file
    for (var variableName in variables) {
      if (variables.hasOwnProperty(variableName)) {
        sorted.push(variableName);
      }
    }
    sorted.sort();
    for (var i = 0; i < sorted.length; i++) {
      lines.push('$' + sorted[i] + ': ' + variables[sorted[i]] + ';');
    }
    return lines.join('\n');
  }

  return {
    parseVariables: parseVariables,
    setVariables: setVariables
  }
}
