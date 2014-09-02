angular.module('sgApp')
  .controller('MainCtrl', function ($scope, Socket) {
    // Emit ready event.
    Socket.emit('ready');

    // Listen for the talk event.
    Socket.on('talk', function(data) {
      alert(data.message)
    });

    $scope.sections = [{
      title: 'Title',
      description: 'This is a description',
      markup: '<button>Hello</button>'
    }];
  });