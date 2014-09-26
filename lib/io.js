var fs = require('fs');

module.exports = function(io, sourcePath, outputPath) {

  var loadDefaults = function(sourcePath, io) {

    return function() {
      fs.readFile(sourcePath + '/styles/_styleguide_variables.scss', {encoding: 'utf8'}, function(err, data) {
        var line, splitData, values = {};
        if (err) {
          return console.error(err);
        }
        splitData = data.split('\n');
        for (var i=0;i<splitData.length;i++) {
          if (splitData[i] && splitData[i].charAt(0) !== '#') {
            line = splitData[i].trim().replace(/;$/, '').split(': ');
            values[line[0]] = line[1];
          }
        }
        io.emit('variables-from-server', JSON.stringify(values));
        console.log('variables-from-server event');
      });
    };
  };

  io.on('connection', loadDefaults(sourcePath, io));

};

