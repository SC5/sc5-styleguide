angular.module('sgApp')
  .controller('SectionsCtrl', [
    '$scope', '$stateParams', '$location', '$state', '$rootScope', 'Styleguide',
    function($scope, $stateParams, $location, $state, $rootScope, Styleguide) {

    if ($stateParams.section) {
      $scope.currentSection = $stateParams.section;
      $rootScope.currentSection = $scope.currentSection;
    } else {
      $location.url('overview');
    }

    // Check if section is a main section
    $scope.filterMainSection = function(section) {
      return !/([0-9]\.)/.test(section.reference);
    }

    $rootScope.$watch(function() {
      return Styleguide.sections.data;
    }, function() {
      setPageTitle($scope.currentSection);
    });

    $rootScope.$watch(function() {
      return Styleguide.config.data;
    }, function(l) {
      setPageTitle($scope.currentSection);
    });

    function setPageTitle(section) {
      if (!Styleguide.config.data || !Styleguide.sections.data) {
        return;
      }
      if (section === 'all') {
        $rootScope.pageTitle = 'All sections - ' + Styleguide.config.data.title;
      } else {
        var result = Styleguide.sections.data.filter(function(item) {
          return item.reference === section;
        });
        if (result.length > 0) {
          var element = result[0];
          $rootScope.pageTitle = element.reference + ' ' + element.header + ' - ' + Styleguide.config.data.title
        }
      }
    }

    // Check section level (main/sub/sub-sub/sub-sub-sub)
    $scope.getLevel = function(section) {
      if (/([0-9]\.)/.test(section.reference)) {
        return section.reference.split('.').map(function(i){
          return 'sub'
        }).join('-').substring(4);
      }
      return 'main';
    }

    $scope.getActive = function(section) {
      return section.reference == $rootScope.currentReference.section.reference? 'active' : '';
    }

    $scope.getClass = function(section) {
      return this.getLevel(section) + ' ' + this.getActive(section);
    }

    $scope.filterSection = function(section) {
      if ($scope.currentSection === 'all') return true;
      var re = new RegExp('(^' + $scope.currentSection + '$)|(^' +
        $scope.currentSection + '\\.)');
      return re.test(section.reference);
    }

    $scope.getCommonClass = function() {
      return Styleguide.config.data.commonClass;
    }
  }]);
