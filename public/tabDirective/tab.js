angular.module('jsonBeautifyAngular')
    .directive('tab', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'tabDirective/tab.html',
            scope: {
                tabs: '=',
                selected: '=',
                addTabCallback: '=',
                closeTabCallback: '='
            },
            controller: function ($scope, $timeout) {
                $scope.selectTab = function (tab) {
                    $scope.selected = tab;
                    $scope.endEditingTagName();
                };

                $scope.closeTab = function (tab) {
                    $scope.closeTabCallback(tab);
                    if ($scope.selected === $scope.tabs.length)
                        $scope.selectTab($scope.selected - 1);
                    else
                        $scope.selectTab($scope.selected);
                };

                $scope.addTab = function () {
                    $scope.addTabCallback();
                    $scope.endEditingTagName();
                };

                $scope.beginEditingTagName = function (index) {
                    $scope.editingTagName = true;
                    $timeout(function () {
                        angular.element('#editTagName' + index).focus()
                    }, 0);
                };

                $scope.endEditingTagName = function () {
                    $scope.editingTagName = false;
                };


                $scope.selectTab(0);
            }
        }
    });