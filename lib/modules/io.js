var fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  writer = require('./variable-writer');

module.exports = function(ioServer, options) {

  var io = ioServer,
    compileError = false;

  if (options.styleVariables && !fs.existsSync(options.styleVariables)) {
    console.error('Could not find SASS variables file', options.styleVariables);
    return;
  }

  function groupVariablesByFilename(variables) {
    return variables.reduce(function(prev, curr) {
      var filePath = curr.file;
      if (!prev[filePath]) {
        prev[filePath] = [];
      }
      prev[filePath].push(curr);
      return prev;
    }, {});
  }

  function saveVariables(variables) {
    return Q.Promise(function(resolve) {

      // First group variables by file name
      var groupedVariables = groupVariablesByFilename(variables),
        filePromises = [];

      // Go trough every file and update variables defined in that file
      Object.keys(groupedVariables).forEach(function(filePath) {
        filePromises.push(Q.promise(function(resolveFile) {
          var fileVariables = groupedVariables[filePath],
            syntax = path.extname(filePath).substring(1);

          // Read original file contents to be updated
          fs.readFile(filePath, {encoding: 'utf8'}, function(err, originalData) {
            // Update variables and store results back to the original file
            var data = writer.setVariables(originalData, syntax, fileVariables);
            fs.writeFile(filePath, data, function(err) {
              if (err) {
                console.error(err);
              }
              resolveFile();
            });
          });
        }));
      });

      Q.all(filePromises).then(function() {
        resolve();
      });
    });
  }

  function emitProgressStart() {
    io.sockets.emit('styleguide progress start');
  }

  function emitProgressEnd() {
    io.sockets.emit('styleguide progress end');
  }

  function emitCompileError(err) {
    compileError = true;
    io.sockets.emit('styleguide compile error', err);
    emitProgressEnd();
  }

  function emitCompileSuccess() {
    compileError = false;
    io.sockets.emit('styleguide compile success');
    emitProgressEnd();
  }

  io.on('connection', function(socket) {
    console.log('Socket connection established (id:', socket.conn.id + ')');
    socket.on('variables to server', function(variables) {
      saveVariables(variables).then(function() {
        socket.emit('variables saved to server');
        console.log('EVENT: variables saved to server');
      });
    });
    if (compileError) {
      emitCompileError();
    } else {
      emitCompileSuccess();
    }
  });

  return {
    saveVariables: saveVariables,
    groupVariablesByFilename: groupVariablesByFilename,
    emitProgressStart: emitProgressStart,
    emitCompileError: emitCompileError,
    emitCompileSuccess: emitCompileSuccess
  };

};
