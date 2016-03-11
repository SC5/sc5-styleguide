describe('Section directive', function() {
    var $rootScope, $timeout, $scope, elem, html;

    beforeEach(module('sgApp'));

    beforeEach(function() {
        html = '<article sg-section ng-repeat="section in relatedSections"></article>';

        inject(function(_$rootScope_, _$timeout_, $compile, $templateCache) {
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            $templateCache.put('views/partials/section.html', '<section>Section</section>');
            $scope = $rootScope.$new();

            $scope.markupSection = {
                isVisible: true
            };

            $scope.relatedSections = [
                {
                    header: 'Section Title',
                    description: 'Section Description',
                    deprecated: false,
                    experimental: false,
                    reference: '1',
                    markup: null,
                    syntax: 'less',
                    file: 'section.less',
                    modifiers: [],
                    wrapper: '<sg-wrapper-content/>'
                }
            ];

            elem = angular.element(html);
            $compile(elem)($scope);
            $scope.$apply();
            $timeout.flush();
        });
    });

    it('should set showMarkup based off of global setting', function() {
        expect($scope.relatedSections[0].showMarkup).to.be.true;
    });

    it('should default css to be hidden', function() {
        expect($scope.relatedSections[0].showCSS).to.be.false;
    });

    it('should not set the currentReference when the height of the element is 0', function() {
        expect($rootScope.currentReference.section.header).to.be.undefined;
        expect($rootScope.currentReference.section.reference).to.be.undefined;
    });
});
