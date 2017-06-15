angular.module('jsonBeautifyAngular')
    .directive('help', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'helpDirective/help.html',
            scope: {},
            controller: function ($scope) {
            }
        }
    });