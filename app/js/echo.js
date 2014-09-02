$(document).ready(function() {

  io = io.connect()

  // Emit ready event.
  io.emit('ready');

  // Listen for the talk event.
  io.on('talk', function(data) {
    alert(data.message)
  });

});

