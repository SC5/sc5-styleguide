angular.module('sgApp')
  .controller('ElementCtrl', function($scope, $stateParams, $state,
    Styleguide, Variables, $filter) {

    var section = $stateParams.section.split('-'),
      reference = section[0],
      modifier = section[1];

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
        $scope.variables = Variables.variables;

        $scope.markup = $filter('setVariables')(element.wrappedMarkup, $scope.variables);

      })
      .error(function() {
        console.log('error');
      });

  });
