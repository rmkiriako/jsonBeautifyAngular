angular.module('jsonBeautifyAngular')
    .directive('beautify', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'beautify/beautify.html',
            scope: {},
            controller: function ($scope, $window) {
                window.s = $scope;

                var Building = {NONE: 0, STRING_SINGLE: 1, STRING_DOUBLE: 2, INTEGER: 3, NULL: 4};
                var TokenType = {COLON: 0, COMMA: 1, NULL: 2, STRING: 3, BRACKET_OPEN: 4, BRACKET_CLOSE: 5};

                $scope.count = 1;
                $scope.tabNames = [0];
                $scope.selected = 0;
                $scope.raws = [];
                $scope.prettys = [];

                // -- BEAUTIFY --

                $scope.beautify = function () {
                    $scope.pretty = "";
                    var tab = 0;

                    var trimmed = $scope.trim($scope.raw);
                    var token = $scope.lex(trimmed);
                    var newLine = false;

                    for (var i = 0; i < token.length; i++) {
                        var t = token[i];
                        switch (t[0]) {
                            case TokenType.BRACKET_OPEN:
                                newLine = true;
                                tab++;
                                $scope.pretty += t[1] + " ";
                                break;
                            case TokenType.BRACKET_CLOSE:
                                $scope.pretty += "\n" + $scope.makeTab(--tab) + t[1];
                                break;
                            case TokenType.COLON:
                                $scope.pretty += " : ";
                                break;
                            case TokenType.COMMA:
                                newLine = true;
                                $scope.pretty += ", ";
                                break;
                            case TokenType.NULL:
                                if (newLine) {
                                    $scope.pretty += "\n" + $scope.makeTab(tab);
                                    newLine = false;
                                }
                                $scope.pretty += "null";
                                break;
                            case TokenType.STRING:
                                if (newLine) {
                                    $scope.pretty += "\n" + $scope.makeTab(tab);
                                    newLine = false;
                                }
                                $scope.pretty += '"' + t[1] + '"';
                                break;
                        }
                    }
                };

                $scope.trim = function (raw) {
                    var start = raw.indexOf('{');
                    var end = raw.lastIndexOf('}');
                    if (start === -1 || end === -1)
                        return "";
                    return raw.substring(start, end + 1);
                };

                $scope.lex = function (rawChar) {
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
                                        if ($scope.isInteger(c)) {
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
                                if ($scope.isInteger(c))
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

                $scope.isInteger = function (c) {
                    return (c >= '0' && c <= '9' || c === '.');
                };

                $scope.makeTab = function (tab) {
                    var s = '';
                    for (var i = 0; i < tab; i++)
                        s += "    ";
                    return s;
                };

                // -- UI --

                $scope.selectTab = function (tab) {
                    $scope.raws[$scope.selected] = $scope.raw;
                    $scope.prettys[$scope.selected] = $scope.pretty;
                    $scope.selected = tab;
                    $scope.raw = $scope.raws[$scope.selected];
                    $scope.pretty = $scope.prettys[$scope.selected];
                };

                $scope.updateInput = function () {
                    if ($scope.selected === $scope.count - 1)
                        $scope.tabNames.push($scope.count++);
                    $scope.beautify();
                };

                $scope.selectAll = function (event) {
                    var selection = $window.getSelection();
                    var range = $window.document.createRange();
                    range.selectNodeContents(event.currentTarget);
                    selection.removeAllRanges();
                    selection.addRange(range);
                };
            }
        }
    });