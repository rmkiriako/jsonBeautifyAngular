angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautifyDirective/beautify.html',
            scope: {},
            controller: function ($scope, $window, sessionsFactory, storeService) {

                $scope.init = function () {
                    $scope.hideSideBars = true;
                    $scope.sessionSelected = {x: 0};
                    $scope.pairSelected = 0;
                    sessionsFactory.setSessionsX(storeService.loadStore());
                    $scope.sessions = sessionsFactory.getAllSessions();
                    storeService.saveStore($scope.sessions);
                };

                $scope.resetStore = function () {
                    $scope.showRestoreStore = storeService.resetStore();
                    $scope.sessions = sessionsFactory.reset();
                };

                $scope.restoreStore = function () {
                    storeService.restoreStore();
                    $scope.init();
                };

                $scope.updateInput = function () {
                    sessionsFactory.updatePair($scope.sessionSelected.x, $scope.pairSelected);
                    storeService.saveStore($scope.sessions);
                };

                $scope.selectAll = function (event) {
                    var selection = $window.getSelection();
                    if (!selection.isCollapsed)
                        return;
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
                    storeService.saveStore($scope.sessions);
                };

                $scope.clearTrashedPairs = function () {
                    sessionsFactory.clearTrashedPairs($scope.sessionSelected.x);
                    storeService.saveStore($scope.sessions);
                };

                $scope.addPairCallback = function () {
                    $scope.pairSelected = sessionsFactory.addPair($scope.sessionSelected.x);
                    storeService.saveStore($scope.sessions);
                };

                $scope.closePairCallback = function (pairIndex) {
                    sessionsFactory.removePair($scope.sessionSelected.x, pairIndex);
                    if (pairIndex < $scope.pairSelected)
                        $scope.pairSelected--;
                    else if ($scope.pairSelected === $scope.sessions[$scope.sessionSelected.x].pairCount)
                        $scope.pairSelected--;
                    storeService.saveStore($scope.sessions);
                };

                $scope.selectSessionCallback = function () {
                    $scope.pairSelected = 0;
                };

                $scope.addSessionCallback = function () {
                    $scope.sessionSelected.x = sessionsFactory.addSession();
                    $scope.pairSelected = 0;
                    storeService.saveStore($scope.sessions);
                };

                $scope.closeSessionCallback = function (sessionIndex) {
                    sessionsFactory.removeSession(sessionIndex);
                    if (sessionIndex < $scope.sessionSelected.x)
                        $scope.sessionSelected.x--;
                    else if ($scope.sessionSelected.x === $scope.sessions.length)
                        $scope.sessionSelected.x--;
                    storeService.saveStore($scope.sessions);
                };

                $scope.editTabNameCallback = function () {
                    storeService.saveStore($scope.sessions);
                };

                $scope.init();
            }
        }
    });