var fs = require('fs');

module.exports = function(io, sourcePath, outputPath) {

  var loadVariables, saveVariables;

  loadVariables = function(socket) {
    return function() {
      fs.readFile(sourcePath + '/styles/_styleguide_variables.scss', {encoding: 'utf8'}, function(err, data) {
        var line, splitData, values = {};
        if (err) {
          return console.error(err);
        }
        splitData = data.split('\n');
        for (var i = 0;i < splitData.length;i++) {
          if (splitData[i] && splitData[i].charAt(0) !== '#') {
            line = splitData[i].trim().replace(/;$/, '').split(': ');
            values[line[0]] = line[1];
          }
        }
        socket.emit('variables from server', values);
        console.log('EVENT: variables from server');
      });
    };
  };

  saveVariables = function(socket) {
    return function(data) {
      var lines = [], sassVariables, sassVariableNames = [];

      console.log(data);
      sassVariables = data;

      // Order variable names TODO: better sorting and/or block system
      for (var variableName in sassVariables) {
        if (sassVariables.hasOwnProperty(variableName)) {
          sassVariableNames.push(variableName);
        }
      }
      sassVariableNames.sort();

      for (var i = 0;i < sassVariableNames.length;i++) {
        lines.push(sassVariableNames[i] + ': ' + sassVariables[sassVariableNames[i]]);
      }

      fs.writeFile(outputPath + '/styles/_styleguide_variables.scss', lines.join('\n'), function(err, data) {
        if (err) {
          return console.error(err);
        }
        socket.emit('variables saved to server', sassVariables);
        console.log('EVENT: variables saved to server');
      });

    };
  };

  io.on('connection', function(socket) {
    socket.on('request variables from server', loadVariables(socket));
    socket.on('variables to server', saveVariables(socket));
  });

};
