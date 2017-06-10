angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautifyDirective/beautify.html',
            scope: {},
            controller: function ($scope, $window, $cookies, beautifyFactory) {
                $scope.init = function () {
                    $scope.sessionSelected = $scope.pairSelected = 0;
                    $scope.sessions = beautifyFactory.getAllSessions();
                };

                $scope.updateInput = function () {
                    beautifyFactory.updatePair($scope.sessionSelected, $scope.pairSelected);
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
                    beautifyFactory.restoreTrashedPair($scope.sessionSelected, index);
                    $scope.pairSelected = $scope.sessions[sessionSelected].pairs.length - 1;
                };

                $scope.addPairCallback = function () {
                    $scope.pairSelected = beautifyFactory.addPair($scope.sessionSelected);
                };

                $scope.closePairCallback = function (pairIndex) {
                    beautifyFactory.removePair($scope.sessionSelected, pairIndex);
                };

                $scope.selectSessionCallback = function () {
                    $scope.pairSelected = 0;
                };

                $scope.addSessionCallback = function () {
                    $scope.sessionSelected = beautifyFactory.addSession();
                    $scope.pairSelected = 0;
                };

                $scope.closeSessionCallback = function (sessionIndex) {
                    beautifyFactory.removeSession(sessionIndex);
                };

                $scope.init();
            }
        }
    });