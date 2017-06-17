angular.module('jsonBeautifyAngular')
    .factory('sessionsFactory', function (beautifyService) {
        var maxSessionCount;
        var sessionCount;
        var trashedSessions;
        var sessions;

        var init = function () {
            maxSessionCount = 0;
            sessionCount = 1;
            trashedSessions = [];
            sessions = [newSession()];
        };

        var newPair = function (index) {
            return {tabName: index, raw: '', pretty: ''};
        };

        var newSession = function () {
            return {
                tabName: 'session ' + maxSessionCount++,
                maxPairCount: 1,
                pairCount: 1,
                pairs: [newPair(0)],
                trashedPairs: []
            }
        };

        init();

        return {
            getAllSessions: function () {
                return sessions;
            },

            updatePair: function (sessionIndex, pairIndex) {
                var session = sessions[sessionIndex];
                var pair = session.pairs[pairIndex];
                pair.pretty = beautifyService.beautify(pair.raw);
                if (pairIndex === session.pairCount - 1)
                    session.pairs[session.pairCount++] = newPair(session.maxPairCount++);
            },

            removePair: function (sessionIndex, pairIndex) {
                var session = sessions[sessionIndex];
                var trashedPair = session.pairs.splice(pairIndex, 1)[0];
                if (trashedPair.raw)
                    session.trashedPairs.push(trashedPair);
                if (session.pairCount > 1)
                    session.pairCount--;
                else
                    session.pairs[0] = newPair(session.maxPairCount++);
            },

            addPair: function (sessionIndex) {
                var session = sessions[sessionIndex];
                session.pairs[session.pairCount++] = newPair(session.maxPairCount++);
                return session.pairCount - 1;
            },

            restoreTrashedPair: function (sessionIndex, pairIndex) {
                var session = sessions[sessionIndex];
                var trashedPair = session.trashedPairs.splice(pairIndex, 1)[0];
                session.pairs.push(trashedPair);
                session.pairCount++;
            },

            clearTrashedPairs: function (sessionIndex) {
                sessions[sessionIndex].trashedPairs = [];
            },

            removeSession: function (sessionIndex) {
                var trashedSession = sessions.splice(sessionIndex, 1)[0];
                if (trashedSession.pairs.length && trashedSession.pairs[0].raw)
                    trashedSessions.push(trashedSession);
                if (sessionCount > 1)
                    sessionCount--;
                else
                    sessions[0] = newSession();
            },

            addSession: function () {
                sessions[sessionCount++] = newSession();
                return sessionCount - 1;
            },

            reset: function () {
                init();
                return sessions;
            },

            setSessionsX: function (x) {
                if (!x)
                    return;
                sessions = x;
                maxSessionCount = sessionCount = sessions.length;
                trashedSessions = [];
            }
        };
    });