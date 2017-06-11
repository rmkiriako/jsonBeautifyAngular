angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautifyDirective/beautify.html',
            scope: {},
            controller: function ($scope, $window, $cookies, sessionsFactory) {
                $scope.init = function () {
                    $scope.sessionSelected = {x: 0};
                    $scope.pairSelected = 0;
                    $scope.sessions = sessionsFactory.getAllSessions();
                    $scope.loadStore();
                    $scope.saveStore();
                };

                $scope.loadStore = function () {
                    var store = $cookies.getObject('jsonBeautifyAngular');
                    if (store && store.x && store.x.length && store.x[0] && store.x[0].pairs && store.x[0].pairs.length && store.x[0].pairs[0] && store.x[0].pairs[0].raw) {
                        $scope.sessions = store.x;
                        sessionsFactory.setSessionsX($scope.sessions);
                    }
                };

                $scope.saveStore = function () {
                    $cookies.putObject('jsonBeautifyAngular', {x: $scope.sessions});
                };

                $scope.resetStore = function () {
                    $cookies.remove('jsonBeautifyAngular');
                    $scope.prevStore = $scope.sessions;
                    $scope.sessions = sessionsFactory.reset();
                };

                $scope.restoreStore = function () {
                    $cookies.putObject('jsonBeautifyAngular', {x: $scope.prevStore});
                    $scope.loadStore();
                };

                $scope.updateInput = function () {
                    sessionsFactory.updatePair($scope.sessionSelected.x, $scope.pairSelected);
                    $scope.saveStore();
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
                    sessionsFactory.restoreTrashedPair($scope.sessionSelected.x, index);
                    $scope.pairSelected = $scope.sessions[$scope.sessionSelected.x].pairs.length - 1;
                    $scope.saveStore();
                };

                $scope.clearTrashedPairs = function () {
                    sessionsFactory.clearTrashedPairs($scope.sessionSelected.x);
                    $scope.saveStore();
                };

                $scope.addPairCallback = function () {
                    $scope.pairSelected = sessionsFactory.addPair($scope.sessionSelected.x);
                    $scope.saveStore();
                };

                $scope.closePairCallback = function (pairIndex) {
                    sessionsFactory.removePair($scope.sessionSelected.x, pairIndex);
                    if (pairIndex < $scope.pairSelected)
                        $scope.pairSelected--;
                    $scope.saveStore();
                };

                $scope.selectSessionCallback = function () {
                    $scope.pairSelected = 0;
                };

                $scope.addSessionCallback = function () {
                    $scope.sessionSelected.x = sessionsFactory.addSession();
                    $scope.pairSelected = 0;
                    $scope.saveStore();
                };

                $scope.closeSessionCallback = function (sessionIndex) {
                    sessionsFactory.removeSession(sessionIndex);
                    if (sessionIndex < $scope.sessionSelected.x)
                        $scope.sessionSelected.x--;
                    $scope.saveStore();
                };

                $scope.init();
            }
        }
    });