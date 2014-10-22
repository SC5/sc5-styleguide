angular.module('sgApp')
  .controller('ElementCtrl', function($scope, $stateParams, $state,
    $rootScope, Styleguide) {

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
        $scope.sections = data.sections;
        $rootScope.config = data.config

        // Load config.settings from localStorage if possible
        var variables = localStorageService.get('variables');
        if (variables) {
          $rootScope.config.settings = variables;
        }

        generateCss();
      })
      .error(function() {
        console.log('error');
      });

  });
