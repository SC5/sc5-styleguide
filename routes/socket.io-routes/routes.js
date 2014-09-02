module.exports = (function() {

    return function(app) {
      app.io.route('ready', function(req) {
        console.log('ready recieved!'); 
      });

      return true;
    };

}());

