angular.module('sgApp')
  .controller('ElementCtrl', function($scope, $stateParams, $state,
    $rootScope, Styleguide) {

    var section = $stateParams.section.split('.'),
      reference,
      modifier;

    if (section.length == 3) {
      modifier = section[2];
      reference = section[0] + '.' + section[1];
    } else {
      reference = $stateParams.section;
    }

    Styleguide.get()
      .success(function(data) {
        var result = data.sections.filter(function(item) {
          return reference == item.reference;
        }),
        element = result[0];
        if (modifier) {
          element = element.modifiers[modifier - 1];
        }
        $scope.section = element;
      })
      .error(function() {
        console.log('error');
      });

  });
