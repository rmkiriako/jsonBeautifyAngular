angular.module('jsonBeautifyAngular')
    .service('storeService', function ($cookies) {
        var prevStore;

        this.loadStore = function () {
            var store = $cookies.getObject('jsonBeautifyAngular');
            if (store && store.x && store.x.length && store.x[0] && store.x[0].pairs && store.x[0].pairs.length && store.x[0].pairs[0])
                return store.x;
            return null;
        };

        this.saveStore = function (sessions) {
            $cookies.putObject('jsonBeautifyAngular', {x: sessions});
        };

        this.resetStore = function () {
            prevStore = this.loadStore();
            $cookies.remove('jsonBeautifyAngular');
            return prevStore;
        };

        this.restoreStore = function () {
            $cookies.putObject('jsonBeautifyAngular', {x: prevStore});
        };
    });