angular.module('jsonBeautifyAngular')
    .service('shortcutService', function ($timeout, $document) {
        this.addShortcut = function (key, ctrl, shift, action) {
            $document.on('keypress', function (e) {
                if (e.key === key && (e.ctrlKey || !ctrl) && (e.shiftKey|| !shift))
                    $timeout(action());
            });
        };
    });