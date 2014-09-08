/* Simple express.io server */
var express = require('express.io');
var app = require('express.io')();
app.http().io();
app.use(express.static(__dirname + '/../public'));

Serve styleguide JSON
app.get('/styleguide', function(req, res) {
  res.send(styleguide);
});

app.io.route('ready', function(req) {
  req.io.emit('update', styleguide);
});

app.listen(opt.port);
gutil.log(PLUGIN_NAME, 'running at http://localhost:' + opt.port + '. Godspeed!');