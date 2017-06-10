angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautifyDirective/beautify.html',
            scope: {},
            controller: function ($scope, $window, $cookies, beautifyFactory) {
                $scope.sessions = [1, 2, 3];

                $scope.init = function () {
                    $scope.pairs = beautifyFactory.getAllPairs();
                    $scope.trashedPairs = beautifyFactory.getAllTrashedPairs();
                };

                $scope.updateInput = function () {
                    beautifyFactory.updatePair($scope.tabSelected);
                };

                $scope.selectAll = function (event) {
                    var selection = $window.getSelection();
                    var range = $window.document.createRange();
                    range.selectNodeContents(event.currentTarget);
                    selection.removeAllRanges();
                    selection.addRange(range);
                };

                $scope.setTrashPreview = function (trashPair) {
                    $scope.trashPreview = trashPair ? trashPair.raw : '';
                };

                $scope.restoreTrashedPair = function (index) {
                    $scope.setTrashPreview();
                    beautifyFactory.restoreTrashedPair(index);
                    $scope.tabSelected = $scope.pairs.length - 1;
                };

                $scope.addTabCallback = function () {
                    $scope.tabSelected = beautifyFactory.addPair();
                };

                $scope.closeTabCallback = function (tab) {
                    beautifyFactory.removePair(tab);
                };

                $scope.init();
            }
        }
    });