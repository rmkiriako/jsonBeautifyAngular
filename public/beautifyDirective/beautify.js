angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautifyDirective/beautify.html',
            scope: {},
            controller: function ($scope, $window, $cookies, beautifyFactory) {
                $scope.init = function () {
                    $scope.sessionSelected = {x: 0};
                    $scope.pairSelected = 0;
                    $scope.sessions = beautifyFactory.getAllSessions();
                };

                $scope.updateInput = function () {
                    beautifyFactory.updatePair($scope.sessionSelected.x, $scope.pairSelected);
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
                    beautifyFactory.restoreTrashedPair($scope.sessionSelected.x, index);
                    $scope.pairSelected = $scope.sessions[$scope.sessionSelected.x].pairs.length - 1;
                };

                $scope.clearTrashedPairs = function () {
                    $scope.sessions[$scope.sessionSelected.x].trashedPairs = [];
                };

                $scope.addPairCallback = function () {
                    $scope.pairSelected = beautifyFactory.addPair($scope.sessionSelected.x);
                };

                $scope.closePairCallback = function (pairIndex) {
                    beautifyFactory.removePair($scope.sessionSelected.x, pairIndex);
                    if (pairIndex < $scope.pairSelected)
                        $scope.pairSelected--;
                };

                $scope.selectSessionCallback = function () {
                    $scope.pairSelected = 0;
                };

                $scope.addSessionCallback = function () {
                    $scope.sessionSelected.x = beautifyFactory.addSession();
                    $scope.pairSelected = 0;
                };

                $scope.closeSessionCallback = function (sessionIndex) {
                    beautifyFactory.removeSession(sessionIndex);
                    if (sessionIndex < $scope.sessionSelected.x)
                        $scope.sessionSelected.x--;
                };

                $scope.init();
            }
        }
    });