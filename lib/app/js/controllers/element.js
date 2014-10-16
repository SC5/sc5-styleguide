angular.module('sgApp')
  .controller('ElementCtrl', function($scope, $stateParams, $state,
    $rootScope, Styleguide) {

    Styleguide.get()
      .success(function(data){
        var result = data.sections.filter(function(item){
          return $stateParams.section == item.reference;
        });
        $scope.section = result[0];
      })
      .error(function(){
        console.log('error');
      });

  });
