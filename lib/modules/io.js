var fs = require('fs'),
  path = require('path'),
  parser = require('./variable-parser');

module.exports = function(ioServer, options) {

  var loadVariables,
    saveVariables,
    io = ioServer;

  if (options.styleVariables && !fs.existsSync(options.styleVariables)) {
    console.error('Could not find SASS variables file', options.styleVariables);
    return;
  }

  loadVariables = function(socket) {
    return function() {
      var values, syntax = path.extname(options.styleVariables).substring(1);
      fs.readFile(options.styleVariables, {encoding: 'utf8'}, function(err, data) {
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
      var syntax = path.extname(options.styleVariables).substring(1);
      fs.readFile(options.styleVariables, {encoding: 'utf8'}, function(err, originalData) {
        var data = parser.setVariables(originalData, syntax, variables);
        fs.writeFile(options.styleVariables, data, function(err, data) {
          if (err) {
            return console.error(err);
          }
          socket.emit('variables saved to server', data);
          console.log('EVENT: variables saved to server');
        });
      });
    };
  };

  function emitProgressStart() {
    io.sockets.emit('styleguide progress start');
  }

  function emitProgressEnd() {
    io.sockets.emit('styleguide progress end');
  }

  function emitCompileError(err) {
    io.sockets.emit('styleguide compile error', err);
    emitProgressEnd();
  }

  function emitCompileSuccess() {
    io.sockets.emit('styleguide compile success');
    emitProgressEnd();
  }

  io.on('connection', function(socket) {
    console.log('Socket connection established (id:', socket.conn.id + ')');
    socket.on('request variables from server', loadVariables(socket));
    socket.on('variables to server', saveVariables(socket));
  });

  return {
    emitProgressStart: emitProgressStart,
    emitCompileError: emitCompileError,
    emitCompileSuccess: emitCompileSuccess
  }
};
