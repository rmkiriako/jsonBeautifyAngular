angular.module('jsonBeautifyAngular')
    .service('storeService', function () {
        var prevStore;

        this.loadStore = function () {
            var storeString = localStorage.getItem('jsonBeautifyAngular');
            if (storeString) {
                var store = JSON.parse(storeString);
                if (store && store[0] && store[0].pairs && store[0].pairs.length && store[0].pairs[0])
                    return store;
            }
            return null;
        };

        this.saveStore = function (sessions) {
            localStorage.setItem('jsonBeautifyAngular', JSON.stringify(sessions));
        };

        this.resetStore = function () {
            prevStore = this.loadStore();
            localStorage.removeItem('jsonBeautifyAngular');
            return prevStore;
        };

        this.restoreStore = function () {
            this.saveStore(prevStore);
        };
    });