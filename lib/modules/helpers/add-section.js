var through = require('through2'),
    gutil = require('gulp-util'),
    minimist = require('minimist');

module.exports = function() {
  var throughOpts = {
      objectMode: true,
      allowHalfOpen: false
    };

  function bufferFileContents(file, enc, done) {
    console.log('I am file');
    this.push(file);
    done();
  };

  // Parameters
  var args = minimist(process.argv.slice(2)),
    params = {
      name: args.name || args.n,
      order: args.order || args.o
    };

  // Validate params

  if (!params.name) {
    gutil.beep();
    gutil.log(gutil.colors.red("Define name with --name=my-name"));
    return;
  }

  if (!params.order) {
    gutil.beep();
    gutil.log(gutil.colors.red("Define name with --order=1.2.3"));
    return;
  }

  params.order = params.order.toString();

  console.log('I run task', params);


  return through(throughOpts, bufferFileContents, function(cb) {
    cb();
  }).on('end', function() {
    console.log('I stopped the processing');
  });

}
