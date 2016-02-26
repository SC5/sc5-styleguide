var through = require('through2'),
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

  console.log('I run task', params);


  return through(throughOpts, bufferFileContents, function(cb) {
    cb();
  }).on('end', function() {
    console.log('I stopped the processing');
  });

}
