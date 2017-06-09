angular.module('jsonBeautifyAngular')
    .factory('beautifyFactory', function () {
        var Building = {NONE: 0, STRING_SINGLE: 1, STRING_DOUBLE: 2, INTEGER: 3, NULL: 4};
        var TokenType = {COLON: 0, COMMA: 1, NULL: 2, STRING: 3, BRACKET_OPEN: 4, BRACKET_CLOSE: 5};

        var maxCount = count = 1;
        var pairs = [{tabName: 0, raw: '', pretty: ''}];
        var trashedPairs = [];

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
                }
            }
            return pretty;
        };

        trim = function (raw) {
            var start = raw.indexOf('{');
            var end = raw.lastIndexOf('}');
            if (start === -1 || end === -1)
                return "";
            return raw.substring(start, end + 1);
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
                                    building = Building.INT;
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
                    case Building.INT:
                        if (isInteger(c))
                            buildingProgress += c;
                        else {
                            building = Building.NONE;
                            parsed.push([TokenType.STRING, buildingProgress]);
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
            getAllPairs: function () {
                return pairs;
            },

            updatePair: function (index) {
                pairs[index].pretty = beautify(pairs[index].raw);
                if (index === count - 1)
                    pairs[count++] = {tabName: maxCount++, raw: '', pretty: ''};
            },

            removePair: function (index) {
                var trashedPair = pairs.splice(index, 1)[0];
                if (trashedPair.raw)
                    trashedPairs.push(trashedPair);
                if (count > 1)
                    count--;
                else
                    pairs[0] = {tabName: maxCount++, raw: '', pretty: ''};
            },

            addPair: function () {
                pairs[count++] = {tabName: maxCount++, raw: '', pretty: ''};
                return count - 1;
            },

            getAllTrashedPairs: function () {
                return trashedPairs;
            },

            restoreTrashedPair: function (index) {
                var trashedPair = trashedPairs.splice(index, 1)[0];
                pairs.push(trashedPair);
                count++;
            }
        };
    });