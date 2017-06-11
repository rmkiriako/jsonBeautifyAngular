angular.module('jsonBeautifyAngular')
    .factory('beautifyFactory', function () {
        var Building = {NONE: 0, STRING_SINGLE: 1, STRING_DOUBLE: 2, INTEGER: 3, NULL: 4};
        var TokenType = {COLON: 0, COMMA: 1, NULL: 2, STRING: 3, INTEGER: 4, BRACKET_OPEN: 5, BRACKET_CLOSE: 6};

        var maxSessionCount = sessionCount = 1;
        var trashedSessions = [];
        var sessions = [{
            tabName: 0,
            maxPairCount: 1,
            pairCount: 1,
            pairs: [{tabName: 0, raw: '', pretty: ''}],
            trashedPairs: []
        }];

        beautify = function (raw) {
            pretty = "";
            var indent = 0;

            var trimmed = trim(raw);
            var token = lex(trimmed);
            var newLine = false;

            for (var i = 0; i < token.length; i++) {
                var t = token[i];
                switch (t[0]) {
                    case TokenType.BRACKET_OPEN:
                        newLine = true;
                        indent++;
                        pretty += t[1] + " ";
                        break;
                    case TokenType.BRACKET_CLOSE:
                        pretty += "\n" + makeIndent(--indent) + t[1];
                        if (indent === 0)
                            pretty += "\n\n\n\n\n";
                        break;
                    case TokenType.COLON:
                        pretty += " : ";
                        break;
                    case TokenType.COMMA:
                        newLine = true;
                        pretty += ", ";
                        break;
                    case TokenType.NULL:
                        if (newLine) {
                            pretty += "\n" + makeIndent(indent);
                            newLine = false;
                        }
                        pretty += "null";
                        break;
                    case TokenType.STRING:
                        if (newLine) {
                            pretty += "\n" + makeIndent(indent);
                            newLine = false;
                        }
                        pretty += '"' + t[1] + '"';
                        break;
                    case TokenType.INTEGER:
                        if (newLine) {
                            pretty += "\n" + makeIndent(indent);
                            newLine = false;
                        }
                        pretty += t[1];
                        break;
                }
            }
            return pretty;
        };

        trim = function (raw) {
            var start = raw.indexOf('{');
            var end = raw.lastIndexOf('}');
            if (start === -1)
                return "";
            if (end !== -1)
                return raw.substring(start, end + 1);
            return raw.substring(start) + '}';
        };

        lex = function (rawChar) {
            var building = 0;
            var buildingProgress = "";

            var parsed = [];
            for (var i = 0; i < rawChar.length; i++) {
                var c = rawChar[i];
                switch (building) {
                    case Building.NONE:
                        switch (c) {
                            case '{':
                                parsed.push([TokenType.BRACKET_OPEN, '{']);
                                break;
                            case '}':
                                parsed.push([TokenType.BRACKET_CLOSE, '}']);
                                break;
                            case '[':
                                parsed.push([TokenType.BRACKET_OPEN, '[']);
                                break;
                            case ']':
                                parsed.push([TokenType.BRACKET_CLOSE, ']']);
                                break;
                            case 'n':
                            case 'N':
                                building = Building.NULL;
                                buildingProgress = 0;
                                break;
                            case '\'':
                                building = Building.STRING_SINGLE;
                                buildingProgress = "";
                                break;
                            case '"':
                                building = Building.STRING_DOUBLE;
                                buildingProgress = "";
                                break;
                            case ':':
                                parsed.push([TokenType.COLON]);
                                break;
                            case ',':
                                parsed.push([TokenType.COMMA]);
                                break;
                            default:
                                if (isInteger(c)) {
                                    building = Building.INTEGER;
                                    buildingProgress = "" + c;
                                }
                        }
                        break;
                    case Building.NULL:
                        if (((c === 'u' || c === 'U') && buildingProgress === 0) || ((c === 'l' || c === 'L') && buildingProgress > 0)) {
                            if (++buildingProgress === 3) {
                                building = Building.NONE;
                                parsed.push([TokenType.NULL]);
                            }
                        } else {
                            building = Building.NONE;
                            i--;
                        }
                        break;
                    case Building.INTEGER:
                        if (isInteger(c))
                            buildingProgress += c;
                        else {
                            building = Building.NONE;
                            parsed.push([TokenType.INTEGER, buildingProgress]);
                            i--;
                        }
                        break;
                    case Building.STRING_SINGLE:
                        if (c != '\\')
                            if (c != '\'')
                                buildingProgress += c;
                            else {
                                building = Building.NONE;
                                parsed.push([TokenType.STRING, buildingProgress]);
                            }
                        break;
                    case Building.STRING_DOUBLE:
                        if (c != '\\')
                            if (c != '"')
                                buildingProgress += c;
                            else {
                                building = Building.NONE;
                                parsed.push([TokenType.STRING, buildingProgress]);
                            }
                        break;
                }
            }
            return parsed;
        };

        isInteger = function (c) {
            return (c >= '0' && c <= '9' || c === '.');
        };

        makeIndent = function (indent) {
            var s = '';
            for (var i = 0; i < indent; i++)
                s += "    ";
            return s;
        };

        return {
            getAllSessions: function () {
                return sessions;
            },

            updatePair: function (sessionIndex, pairIndex) {
                var session = sessions[sessionIndex];
                var pair = session.pairs[pairIndex];
                pair.pretty = beautify(pair.raw);
                if (pairIndex === session.pairCount - 1)
                    session.pairs[session.pairCount++] = {tabName: session.maxPairCount++, raw: '', pretty: ''};
            },

            removePair: function (sessionIndex, pairIndex) {
                var session = sessions[sessionIndex];
                var trashedPair = session.pairs.splice(pairIndex, 1)[0];
                if (trashedPair.raw)
                    session.trashedPairs.push(trashedPair);
                if (session.pairCount > 1)
                    session.pairCount--;
                else
                    session.pairs[0] = {tabName: session.maxPairCount++, raw: '', pretty: ''};
            },

            addPair: function (sessionIndex) {
                var session = sessions[sessionIndex];
                session.pairs[session.pairCount++] = {tabName: session.maxPairCount++, raw: '', pretty: ''};
                return session.pairCount - 1;
            },

            restoreTrashedPair: function (sessionIndex, pairIndex) {
                var session = sessions[sessionIndex];
                var trashedPair = session.trashedPairs.splice(pairIndex, 1)[0];
                session.pairs.push(trashedPair);
                session.pairCount++;
            },

            removeSession: function (sessionIndex) {
                var trashedSession = sessions.splice(sessionIndex, 1)[0];
                if (trashedSession.pairs.length && trashedSession.pairs[0].raw)
                    trashedSessions.push(trashedSession);
                if (sessionCount > 1)
                    sessionCount--;
                else
                    sessions[0] = {
                        tabName: maxSessionCount++,
                        maxPairCount: 1,
                        pairCount: 1,
                        pairs: [{tabName: 0, raw: '', pretty: ''}],
                        trashedPairs: []
                    };
            },

            addSession: function () {
                sessions[sessionCount++] = {
                    tabName: maxSessionCount++,
                    maxPairCount: 1,
                    pairCount: 1,
                    pairs: [{tabName: 0, raw: '', pretty: ''}],
                    trashedPairs: []
                };
                return sessionCount - 1;
            }
        };
    });