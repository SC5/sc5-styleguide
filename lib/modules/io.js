var fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  writer = require('./variable-writer');

module.exports = function(ioServer, options) {

  var io = ioServer,
    compileError = false,
    fileHashes = options.fileHashes;

  function groupVariablesByFileHash(variables) {
    return variables.reduce(function(result, v) {
      var hash = v.fileHash;
      if (!result[hash]) {
        result[hash] = [];
      }
      result[hash].push(v);
      return result;
    }, {});
  }

  function saveVariables(variables) {
    // First group variables by file hash
    var groupedVariables = groupVariablesByFileHash(variables),
      filePromises = [];

    // Go trough every file and update variables defined in that file
    Object.keys(groupedVariables).forEach(function(fileHash) {
      filePromises.push(Q.promise(function(resolve, reject) {
        var filePath = fileHashes[fileHash],
            fileVariables = groupedVariables[fileHash],
            syntax = path.extname(filePath).substring(1);

        // Read original file contents to be updated
        fs.readFile(filePath, {encoding: 'utf8'}, function(err, originalData) {
          var data;
          if (err) {
            console.error('Unable to read variables file', filePath, err);
            reject(err);
            return;
          }
          try {
            // Update variables and store results back to the original file
            data = writer.setVariables(originalData, syntax, fileVariables);
          } catch (e) {
            reject(e);
            return;
          }
          fs.writeFile(filePath, data, function(err) {
            if (err) {
              console.error('Unable to write variables file', filePath, err);
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }));
    });

    return Q.all(filePromises);
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
      saveVariables(variables).done(function() {
        console.log('EVENT: variables saved to server');
        socket.emit('variables saved to server');
      }, function(err) {
        console.error('Unable to save variables to server:', err);
        emitCompileError(err);
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
    emitProgressStart: emitProgressStart,
    emitCompileError: emitCompileError,
    emitCompileSuccess: emitCompileSuccess
  };

};
