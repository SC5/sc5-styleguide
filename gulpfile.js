var gulp = require('gulp');

gulp.task('default', function(development) {

  var debug = require('debug')('scyleguide');
  var app = require('./app');

  app.set('port', process.env.PORT || 3000);

  var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
  });

});

