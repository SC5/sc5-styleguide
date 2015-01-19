var fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  _ = require('lodash'),
  parser = require('./variable-parser'),
  writer = require('./variable-writer'),
  events = {
    connection: 'connection',
    progress: {
      start: 'styleguide progress start',
      end: 'styleguide progress end'
    },
    styles: {
      changed: 'styleguide styles changed'
    },
    variables: {
      saved: 'variables saved to server',
      toServer: 'variables to server'
    },
    compile: {
      success: 'styleguide compile success',
      error: 'styleguide compile error'
    }
  };

module.exports = function(ioServer, options) {

  var io = ioServer,
    compileError = false,
    fileHashes = options.fileHashes;

  function saveVariables(variables) {
    return Q.promise(function(resolve, reject) {
      try {
        _.chain(variables)
          .groupBy('fileHash')
          .map(asObjectWithFileProperties)
          .forEach(readFileContents)
          .forEach(updateVariableValues)
          .forEach(checkSyntax)
          .forEach(writeFileContents);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  function asObjectWithFileProperties(variables, hash) {
    var filePath = fileHashes[hash];
    return {
      path: filePath,
      syntax: path.extname(filePath).substring(1),
      variables: variables
    };
  }

  function readFileContents(file) {
    file.contents = fs.readFileSync(file.path, { encoding: 'utf8' });
  }

  function updateVariableValues(file) {
    file.contents = writer.setVariables(file.contents, file.syntax, file.variables);
  }

  function checkSyntax(file) {
    parser.parseVariableDeclarations(file.contents, file.syntax);
  }

  function writeFileContents(file) {
    fs.writeFileSync(file.path, file.contents, { encoding: 'utf8' });
  }

  function emitProgressStart() {
    io.sockets.emit(events.progress.start);
  }

  function emitStylesChanged() {
    io.sockets.emit(events.styles.changed);
  }

  function emitProgressEnd() {
    io.sockets.emit(events.progress.end);
  }

  function emitCompileError(err, socket) {
    compileError = err;
    if (socket) {
      socket.emit(events.compile.error, err);
      socket.emit(events.progress.end);
    } else {
      io.sockets.emit(events.compile.error, err);
      io.sockets.emit(events.progress.end);
    }
  }

  function emitCompileSuccess(socket) {
    compileError = false;
    if (socket) {
      socket.emit(events.compile.success);
      socket.emit(events.progress.end);
    } else {
      io.sockets.emit(events.compile.success);
      io.sockets.emit(events.progress.end);
    }
  }

  io.on(events.connection, function(socket) {
    console.log('Socket connection established (id:', socket.conn.id + ')');

    socket.on(events.variables.toServer, function(variables) {
      saveVariables(variables).done(function() {
        console.log('EVENT: variables saved to server');
        socket.emit(events.variables.saved);
      }, function(err) {
        console.error('Unable to save variables to server:', err);
        emitCompileError(err, socket);
      });
    });

    if (compileError) {
      emitCompileError(compileError, socket);
    } else {
      emitCompileSuccess(socket);
    }
  });

  return {
    saveVariables: saveVariables,
    emitProgressStart: emitProgressStart,
    emitProgressEnd: emitProgressEnd,
    emitStylesChanged: emitStylesChanged,
    emitCompileError: emitCompileError,
    emitCompileSuccess: emitCompileSuccess
  };

};
