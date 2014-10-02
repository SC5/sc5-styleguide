'use strict'

angular.module('sgApp')
  .directive('dynamicCompile', function($compile, $parse){
    return {
      link: function($scope, iElm, iAttrs, controller) {
        var parsed = $parse(iAttrs.ngBindHtml);
        function getStringValue() { return (parsed($scope) || '').toString(); }

        //Recompile if the template changes
        $scope.$watch(getStringValue, function() {
          $compile(iElm, null, 0)($scope);
        });
      }
    };
  });
