angular.module('sgApp', []);

angular.module('sgApp')
  .controller('MainCtrl', function ($scope) {

  });

angular.module('sgApp')
  .directive('sgSection', function () {
    return {
      replace: true,
      restrict: 'A',
      template: '<h2>Section title</h2>',
      link: function () {
      }
    };
  });

angular.module('sgApp')
  .factory('Socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
  });