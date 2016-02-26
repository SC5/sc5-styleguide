var through = require('through2');

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

  return through(throughOpts, bufferFileContents, function(cb) {
    cb();
  }).on('end', function() {
    console.log('I stopped the processing');
  });

}
