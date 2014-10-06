module.exports = function(sourcePath, outputPath) {

  var connectLiveReload = require('connect-livereload');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var express = require('express');
  var http = require('http');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var path = require('path');
  var server, io;

  var app = express();

  // TODO make conditional: if <develop>
  app.use(connectLiveReload());

  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  app.use(express.static(outputPath));

  // Let Angular handle all routing
  app.all('/*', function(req, res) {
    res.sendFile(path.join(outputPath + '/index.html'));
  });

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Setup socket.io
  server = require('http').Server(app);
  io = require('socket.io')(server);
  require('./io')(io, sourcePath, outputPath);

  return {
    app: app,
    server: server
  };

};


