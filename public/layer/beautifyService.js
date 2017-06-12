angular.module('jsonBeautifyAngular')
    .service('beautifyService', function () {
        var Building = {NONE: 0, STRING_SINGLE: 1, STRING_DOUBLE: 2, INTEGER: 3, NULL: 4};
        var TokenType = {COLON: 0, COMMA: 1, NULL: 2, STRING: 3, INTEGER: 4, BRACKET_OPEN: 5, BRACKET_CLOSE: 6};

        this.beautify = function (raw) {
            var pretty = "";
            var indent = 0;

            var trimmed = trim(raw);
            var token = lex(trimmed);
            var newLine = false;
            var lineBreak = false;

            for (var i = 0; i < token.length; i++) {
                var t = token[i];
                switch (t[0]) {
                    case TokenType.BRACKET_OPEN:
                        if (lineBreak)
                            pretty += "\n\n\n\n\n";
                        newLine = true;
                        indent++;
                        pretty += t[1] + " ";
                        break;
                    case TokenType.BRACKET_CLOSE:
                        pretty += "\n" + makeIndent(--indent) + t[1];
                        if (indent === 0)
                            lineBreak = true;
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

        var trim = function (raw) {
            var start = raw.indexOf('{');
            var end = raw.lastIndexOf('}');
            if (start === -1)
                start = 0;
            if (end === -1)
                return raw.substring(start) + '}';
            return raw.substring(start, end + 1);
        };

        var lex = function (rawChar) {
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

        var isInteger = function (c) {
            return (c >= '0' && c <= '9' || c === '.');
        };

        var makeIndent = function (indent) {
            var s = '';
            for (var i = 0; i < indent; i++)
                s += "    ";
            return s;
        };
    });