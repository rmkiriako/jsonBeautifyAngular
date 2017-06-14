angular.module('jsonBeautifyAngular')
    .directive('tab', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'tabDirective/tab.html',
            scope: {
                tabs: '=',
                selected: '=',
                vertical: '=?',
                selectTabCallback: '=?',
                addTabCallback: '=?',
                closeTabCallback: '=?',
                editTabNameCallback: '=?'
            },
            controller: function ($scope, $timeout) {
                $scope.selectTab = function (tab) {
                    $scope.selected = tab;
                    $scope.editingTabName = false;
                    if ($scope.selectTabCallback)
                        $scope.selectTabCallback();
                };

                $scope.closeTab = function (tab) {
                    if ($scope.selected === $scope.tabs.length)
                        $scope.selectTab($scope.selected - 1);
                    else
                        $scope.selectTab($scope.selected);
                    if ($scope.closeTabCallback)
                        $scope.closeTabCallback(tab);
                };

                $scope.addTab = function () {
                    $scope.editingTabName = false;
                    if ($scope.addTabCallback)
                        $scope.addTabCallback();
                };

                $scope.beginEditingTabName = function (index) {
                    $scope.editingTabName = true;
                    $timeout(function () {
                        angular.element('#editTabName' + index).focus()
                    }, 0);
                };

                $scope.endEditingTabName = function (event) {
                    if (event && event.key !== 'Enter')
                        return;
                    $scope.editingTabName = false;
                    if ($scope.editTabNameCallback)
                        $scope.editTabNameCallback();
                };


                $scope.selectTab($scope.selected ? $scope.selected : 0);
            }
        }
    });