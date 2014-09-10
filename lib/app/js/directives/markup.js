'use strict';

angular.module('sgApp')
  .directive('sgMarkup', function () {
    return {
      replace: true,
      restrict: 'A',
      template: '<div></div>',
      scope: {
        markup: '='
      },
      link: function (scope, el, attrs) {
        el.html(attrs.markup).show();
      }
    };
  });