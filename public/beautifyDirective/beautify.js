angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautifyDirective/beautify.html',
            scope: {},
            controller: function ($scope, $window, beautifyFactory) {
                $scope.init = function () {
                    $scope.pairs = beautifyFactory.getAllPairs();
                    $scope.trashedPairs = beautifyFactory.getAllTrashedPairs();
                    $scope.selectTab(0);
                };

                $scope.selectTab = function (tab) {
                    $scope.selected = tab;
                    $scope.activePair = $scope.pairs[$scope.selected];
                    $scope.setEditingTagName(false);
                };

                $scope.closeTab = function (tab) {
                    beautifyFactory.removePair(tab);
                    if ($scope.selected === $scope.pairs.length)
                        $scope.selectTab($scope.selected - 1);
                    else
                        $scope.selectTab($scope.selected);
                };

                $scope.addTab = function () {
                    $scope.selected = beautifyFactory.addPair();
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

                $scope.setEditingTagName = function (value) {
                    $scope.editingTagName = value;
                };

                $scope.setTrashPreview = function (trashPair) {
                    $scope.trashPreview = trashPair ? trashPair.raw : '';
                };

                $scope.restoreTrashedPair = function (index) {
                    $scope.setTrashPreview();
                    beautifyFactory.restoreTrashedPair(index);
                    $scope.selectTab($scope.pairs.length - 1);
                };

                $scope.init();
            }
        }
    });