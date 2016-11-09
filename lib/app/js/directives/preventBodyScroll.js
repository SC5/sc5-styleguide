'use strict';

angular.module('sgApp')
.directive('preventBodyScroll', function() {
  return {
    restrict: 'A',
    link: preventBodyScroll
  };

  function preventBodyScroll(scope, element) {
    element.bind('wheel', preventScrollOnElement);
    element.bind('mousewheel', preventScrollOnElement);
    var target = element[0];

    function preventScrollOnElement(ev) {
      if (event.deltaY > 0) {
        if (target.scrollTop + target.offsetHeight >= target.scrollHeight) {
          ev.preventDefault();
          ev.returnValue = false;
          return false;
        }
      } else {
        if (target.scrollTop === 0) {
          ev.preventDefault();
          ev.returnValue = false;
          return false;

        }
      }

      ev.returnValue = true;
      return true;
    }
  }
});
