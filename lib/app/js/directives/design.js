'use strict';

angular.module('sgApp')
  .directive('sgDesign', function(Variables, Styleguide) {
    return {
      replace: true,
      restrict: 'A',
      templateUrl: 'views/partials/design.html',
      link: function(scope) {
        var parentRef;

        function isSubSection(section) {
          var ref = section.parentReference;
          return (typeof ref === 'string') &&
            (ref === parentRef || ref.substring(0, ref.indexOf('.')) === parentRef);
        }

        function getVariables(section) {
          return section.variables;
        }

        function concat(a, b) {
          return a.concat(b);
        }

        function unique(a, idx, arr) {
          return a !== undefined && arr.indexOf(a) === idx;
        }

        scope.status = Styleguide.status;
        scope.showRelated = true;

        scope.$watch('currentReference.section', function() {
          var relatedVariables = scope.currentReference.section.variables || [];
          if (scope.showRelated && relatedVariables.length === 0 && scope.sections.data) {
            parentRef = scope.currentReference.section.reference;
            scope.relatedChildVariableNames = scope.sections.data.filter(isSubSection)
              .map(getVariables)
              .reduce(concat, [])
              .filter(unique);
          }
        });

        scope.saveVariables = function() {
          Variables.saveVariables();
        };

        scope.resetLocal = function() {
          Variables.resetLocal();
        };

        scope.dirtyVariablesFound = function() {
          return Variables.variables.some(function(variable) {
            return variable.dirty && variable.dirty === true;
          });
        };

      }
    };
  });
