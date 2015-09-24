module.exports = function(options) {
  var app,
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    express = require('express'),
    logger = require('morgan'),
    path = require('path'),
    basicAuth = require('basic-auth-connect'),
    io,
    server,
    socket;

  app = express();

  //app.use(favicon(__dirname + '/public/favicon.ico'));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(cookieParser());
  if (options.basicAuth) {
    app.use(basicAuth(options.basicAuth.username, options.basicAuth.password));
  }

  app.use(express.static(options.rootPath));

  // Let Angular handle all routing
  app.all('/*', function(req, res) {
    res.sendFile(path.resolve(options.rootPath + '/index.html'));
  });

  // Catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // Setup socket.io
  server = require('http').Server(app);
  socket = require('socket.io')(server);
  io = require('./modules/io')(socket, options);

  return {
    app: app,
    server: server,
    io: io
  };
};
