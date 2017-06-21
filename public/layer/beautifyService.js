angular.module('jsonBeautifyAngular')
    .service('beautifyService', function () {
        var Building = {NONE: 0, STRING_SINGLE: 1, STRING_DOUBLE: 2, STRING_NONE: 3, INTEGER: 4, CONSTANT: 5};
        var TokenType = {COLON: 0, COMMA: 1, CONSTANT: 2, STRING: 3, INTEGER: 5, BRACKET_OPEN: 6, BRACKET_CLOSE: 7};
        var Constant = ['null', 'true', 'false'];
        var allowStringNones, filters;

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
                        if (lineBreak) {
                            pretty += "\n\n\n\n\n";
                            lineBreak = false;
                        }
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
                    case TokenType.CONSTANT:
                        if (newLine) {
                            pretty += "\n" + makeIndent(indent);
                            newLine = false;
                        }
                        pretty += t[1];
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

            return applyFilters(pretty);
        };

        this.setAllowStringNones = function (value) {
            allowStringNones = value;
        };

        this.setFilters = function (filtersString) {
            filters = _.filter(_.map(filtersString.split('|'), function (filter) {
                return filter.trim().toLowerCase();
            }), function (filter) {
                return filter;
            });
        };

        var trim = function (raw) {
            var start = raw.indexOf('{');
            var end = raw.lastIndexOf('}');
            if (start === -1)
                start = 0;
            if (end === -1)
                return raw.substring(start);
            return raw.substring(start, end + 1);
        };

        var lex = function (rawChar) {
            rawChar += ' ';
            var building = 0;
            var buildingProgress = "";

            var parsed = [];
            for (var i = 0; i < rawChar.length; i++) {
                var cCased = rawChar[i];
                var c = cCased.toLowerCase();
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
                            case '(':
                                parsed.push([TokenType.BRACKET_OPEN, '(']);
                                break;
                            case ')':
                                parsed.push([TokenType.BRACKET_CLOSE, ')']);
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
                            case '=':
                                parsed.push([TokenType.COLON]);
                                break;
                            case ',':
                                parsed.push([TokenType.COMMA]);
                                break;
                            default:
                                if (_.findIndex(Constant, function (constant) {
                                        return constant[0] === c;
                                    }) !== -1) {
                                    building = Building.CONSTANT;
                                    buildingProgress = c;
                                } else if (allowStringNones && isStringNone(c)) {
                                    building = Building.STRING_NONE;
                                    buildingProgress = "" + c;
                                } else if (isInteger(c)) {
                                    building = Building.INTEGER;
                                    buildingProgress = "" + c;
                                }
                        }
                        break;
                    case Building.CONSTANT:
                        if (_.findIndex(Constant, function (constant) {
                                return constant === buildingProgress + c;
                            }) !== -1) {
                            building = Building.NONE;
                            parsed.push([TokenType.CONSTANT, buildingProgress + c]);
                        } else if (_.findIndex(Constant, function (constant) {
                                return constant.substring(0, buildingProgress.length + 1) === buildingProgress + c;
                            }) !== -1) {
                            buildingProgress += c;
                        } else if (!allowStringNones) {
                            building = Building.NONE;
                            i -= buildingProgress.length;
                        } else {
                            building = Building.STRING_NONE;
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
                                buildingProgress += cCased;
                            else {
                                building = Building.NONE;
                                parsed.push([TokenType.STRING, buildingProgress]);
                            }
                        break;
                    case Building.STRING_DOUBLE:
                        if (c != '\\')
                            if (c != '"')
                                buildingProgress += cCased;
                            else {
                                building = Building.NONE;
                                parsed.push([TokenType.STRING, buildingProgress]);
                            }
                        break;
                    case Building.STRING_NONE:
                        if (isStringNone(c))
                            buildingProgress += cCased;
                        else {
                            building = Building.NONE;
                            parsed.push([TokenType.STRING, buildingProgress]);
                            i--;
                        }
                        break;
                }
            }
            return parsed;
        };

        var applyFilters = function (pretty) {
            if (!filters || filters.length === 0)
                return pretty;

            var filteredPrettyLines = _.filter(pretty.split('\n'), function (line) {
                var lineLower = line.toLowerCase();
                return _.some(filters, function (filter) {
                    return lineLower.indexOf(filter) !== -1;
                });
            });
            return _.reduce(filteredPrettyLines, function (prev, next) {
                return prev + '\n' + next;
            }, '');
        };

        var isInteger = function (c) {
            return (c >= '0' && c <= '9' || c === '.');
        };

        var isStringNone = function (c) {
            return ['[', '{', ']', '}', '(', ')', ':', ',', '=', ' '].indexOf(c) === -1;
        };

        var makeIndent = function (indent) {
            var s = '';
            for (var i = 0; i < indent; i++)
                s += "    ";
            return s;
        };
    })
;