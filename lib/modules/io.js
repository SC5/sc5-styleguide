var fs = require('fs'),
  path = require('path'),
  Q = require('q'),
  _ = require('lodash'),
  parser = require('./variable-parser'),
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
    },
    validation: {
      // success: Validation does not have success event since it is handled via compile.success
      error: 'styleguide validation error'
    }
  };

module.exports = function(ioServer, options) {

  var io = ioServer,
    compileError = false,
    fileHashes = options.fileHashes;

  function saveVariables(vars) {
    var variables;
    return Q.promise(function(resolve, reject) {
      try {
        variables = _.chain(vars).groupBy('fileHash').map(asObjectWithFileProperties).value();
        variables.forEach(readFileContents);
        variables.forEach(updateVariableValues);
        variables.forEach(checkSyntax);
        variables.forEach(writeFileContents);
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
    file.contents = parser.setVariables(file.contents, file.syntax, file.variables, options);
  }

  function checkSyntax(file) {
    parser.parseVariableDeclarations(file.contents, file.syntax, options);
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
    var error = buildError(compileError, 'Compile error');
    if (socket) {
      socket.emit(events.compile.error, error);
    } else {
      io.sockets.emit(events.compile.error, error);
    }
  }

  function emitValidationError(err, socket) {
    var error = buildError(err, 'Validation error');
    socket.emit(events.validation.error, error);
  }

  function buildError(e, name) {
    return {
      name: name,
      message: e.message || e.toString(),
      wrappedError: e
    };
  }

  function emitCompileSuccess(socket) {
    compileError = false;
    if (socket) {
      socket.emit(events.compile.success);
    } else {
      io.sockets.emit(events.compile.success);
    }
  }

  io.on(events.connection, function(socket) {
    console.log('Socket connection established (id:', socket.conn.id + ')');

    // Listen to save events only when we are not in the readonly mode
    if (!options.readOnly) {
      socket.on(events.variables.toServer, function(variables) {
        saveVariables(variables).done(function() {
          console.log('EVENT: variables saved to server');
          socket.emit(events.variables.saved);
        }, function(err) {
          console.error('Unable to save variables to server:', err);
          console.error(err.message);
          emitValidationError(err, socket);
        });
      });
    }

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
