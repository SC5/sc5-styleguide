module.exports = function(io) {

  io.on('connection', function(data) {
    console.log('connection');
  })

};

