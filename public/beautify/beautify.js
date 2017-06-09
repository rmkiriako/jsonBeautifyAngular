angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautify/beautify.html',
            scope: {},
            controller: function ($scope, $window, beautifyFactory) {
                $scope.init = function () {
                    $scope.pairs = beautifyFactory.getAllPairs();
                    $scope.selectTab(0);
                };

                $scope.selectTab = function (tab) {
                    $scope.selected = tab;
                    $scope.activePair = $scope.pairs[$scope.selected];
                };

                $scope.updateInput = function () {
                    beautifyFactory.updatePair($scope.selected);
                };

                $scope.selectAll = function (event) {
                    var selection = $window.getSelection();
                    var range = $window.document.createRange();
                    range.selectNodeContents(event.currentTarget);
                    selection.removeAllRanges();
                    selection.addRange(range);
                };
                
                $scope.init();
            }
        }
    });