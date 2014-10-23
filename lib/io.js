var fs = require('fs'),
  parser = require('./parser')();

module.exports = function(io, options) {

  var loadVariables, saveVariables;

  if (!fs.existsSync(options.sassVariables)) {
    console.error('Could not find SASS variables file', options.sassVariables);
    return;
  }

  loadVariables = function(socket) {
    return function() {
      var syntax = path.extname(options.sassVariables).substring(1);
      fs.readFile(options.sassVariables, {encoding: 'utf8'}, function(err, data) {
        var values = {};
        if (err) {
          return console.error(err);
        }
        values = parser.parseVariables(data, syntax);
        socket.emit('variables from server', values);
        console.log('EVENT: variables from server');
      });
    };
  };

  saveVariables = function(socket) {
    return function(variables) {
      console.log('received', variables);
      fs.readFile(options.sassVariables, {encoding: 'utf8'}, function(err, originalData) {
        var data = parser.setVariables(originalData, variables);
        fs.writeFile(options.sassVariables, data, function(err, data) {
          if (err) {
            return console.error(err);
          }
          socket.emit('variables saved to server', data);
          console.log('EVENT: variables saved to server');
        });
      });
    };
  };

  io.on('connection', function(socket) {
    socket.on('request variables from server', loadVariables(socket));
    socket.on('variables to server', saveVariables(socket));
  });

};
