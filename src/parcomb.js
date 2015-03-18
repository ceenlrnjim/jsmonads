module.exports = (function() {
    var monads = require("./jsmonads.js");
    var mdo = monads.mdo;
    var thread = monads.thread;
    var parser = monads.parser;
    //var parser = monads.stateM.withMonad(monads.list);
    var empty = parser.empty;
    var message = parser.message;
    var state = parser.state;
    var ok = parser.ok;
    var error = parser.error;
    var consumed = parser.consumed;
    var lzError = parser.lzError;
    var lzConsumed = parser.lzConsumed;
    var match = parser.match;

    if (String.prototype.first === undefined) {
        String.prototype.first = String.prototype.charAt;
    }
    if (String.prototype.rest === undefined) {
        String.prototype.rest = function() { return this.substring(1); };
    }
    if (Array.prototype.first === undefined) {
        Array.prototype.first = function() { return this[0]; };
    }
    if (Array.prototype.rest === undefined) {
        Array.prototype.rest = function() { return this.slice(1); };
    }

    // Again, unlike haskell, JS strings are not lists of characters, so we have to do
    // some special logic to handle cons - TODO: not comfortable that this is all correct yet 
    var cons = function(x,rxs) {
        var xs;
        if (typeof x === 'string' && typeof rxs === 'string') {
            return x.concat(rxs);
        } else if (typeof x !== 'string' && rxs === '') {
            xs = [];
        } else if (typeof x === 'string' && rxs === []) {
            return x;
        } else {
            xs = rxs;
        }

        var r = new Array(xs.length + 1);
        r[0] = x;
        for (var i=0, n=xs.length; i<n;i++) {
            r[i+1] = xs[i];
        }
        return r;
    };

    var nextPos = function(pos, c) {
        // TODO: tab support
        if (c === "\n") {
            return {line: pos.line + 1, col: 1};
        } else {
            return {line: pos.line, col: pos.col + 1};
        };
    };


    // This determines if we are going to aggregate as a list or as a string
    // since in JS a string is not a list of characters, we have separate identity values for the concatenation operation
    // identity is used in the many parser (and those that depend on it) to know how to aggregate values together
    // if your parser is returning a string  (e.g. parsing numbers from digits) use ""
    // otherwise use [] (for actual numbers, functions, objects, etc that are stored in an array)
    var withIdentity = function(identity) {

        var satisfies = function(pred) {
            return function(s) {
                if (!parser.isState(s)) {
                    throw new TypeError("Cannot parse without initial state");
                } else if (s.input.length === 0) {
                    return empty(error(message(s.pos, "End of input", [])));
                } else {
                    var next;
                    next = s.input.first(0);
                    if (pred(next)) {
                        var newPos = nextPos(s.pos, next);
                        var newState = state(s.input.rest(), newPos);
                        // TODO: eval to prevent space leak
                        return consumed(ok(next, newState, message(s.pos, "", [])));
                    } else {
                        return empty(error(message(s.pos, next, [])));
                    }
                }
            };
        };

        /* Parser that matches a specific character */
        var charP = function(c) {
            return label(satisfies(function(v) { return v === c; }, "'" + c + "'"));
        };

        var digit = function() {
            return label(satisfies(function(c) { return c >= '0' && c <= '9'; }), "digit");
        };

        var lower = function() {
            return label(satisfies(function(c) { return c >= 'a' && c <= 'z'; }), "lower");
        };

        var upper = function() {
            return label(satisfies(function(c) { return c >= 'A' && c <= 'Z'; }), "upper");
        };

        var letter = function() {
            return label(parser.mplus(upper(), lower()), "letter");
        };

        var alphanum = function() {
            return label(parser.mplus(letter(), digit()), "alpha-numeric");
        };

        var stringP = function(s) {
            return label(stringPinternal(s), "'" + s + "'");
        };

        /* Parser that matches a specific string */
        var stringPinternal = function(s) {
            if (s.length === 0) return parser.pure(""); // always strings here
            else return mdo(parser, 
                            [charP(s[0]), stringPinternal(s.substring(1))], 
                            function(x, xs) {
                                return parser.pure(x.concat(xs)); // always strings here
                            });
        };

        var many1 = function(p) {
            var pwrap = function() { return p; };
            var many1wrap = function() { return choice(many1(p), parser.pure(identity)); };
            return _pdo([pwrap, many1wrap], 
                function(x,xs) { 
                    return cons(x,xs);
                });
        };

        var many = function(p) {
            var pwrap = function() { return p; };
            var manywrap = function() { return many(p); };
            return parser.mplus(
                _pdo([pwrap, manywrap], function(x,xs) { return cons(x,xs); }),
                parser.pure(identity)); 
                
        };

        var sepBy1 = function(p, separator) {
            var pw = function() { return p; };
            var sepw = function() { return separator; };
            var sepAndP = _pdo([sepw, pw], function(unused, v) { return v; });
            var xsw = function() { return many(sepAndP); };
            return _pdo([pw, xsw], function(x,xs) { return cons(x,xs); });
        };

        var between = function(open, p, close) {
            // manual laziness
            var openw = function() { return open; };
            var pw = function() { return p; };
            var closew = function() { return close; };

            return _pdo([openw, pw, closew], function(una, x, unb) { return x; });
        };

        var sepBy = function(p, sep) {
            return parser.mplus(sepBy1(p, sep), parser.pure(identity));
        };

        var choice = parser.mplus;

        var or = function(/* ordered list of parsers */) {
            var orargs = Array.prototype.slice.call(arguments,0);
            return orargs.reduce(choice);
        };

        var tryP = function(p) {
            return function(inp) {
                return match(p(inp), {
                    consumedError: function(reply) { return empty(error()); },
                    otherwise: function(result) { return result; } });
            };
        };

        // chainl1 p op - returns a parser that parses one or more occurrences of p, separated by op 
        // Returns a value obtained by a left associative application of all functions returned by op 
        // to the values returned by p. . 
        // This parser can for example be used to eliminate left recursion which typically occurs in expression grammars.
        // chainl1 :: Parser a -> Parser (a -> a -> a) -> Parser a
        var chainl1 = function(p, op) {
            var pw = function() { return p; };
            var opw = function() { return op; };
            var fysparser = _pdo([opw, pw], function(f,y) { return [f,y]; });
            var fysparserw = function() { return many(fysparser); };

            return _pdo([pw,fysparserw], function(xinit, fys) {
                return fys.reduce(function(x, fy) {
                    var f = fy[0];
                    var y = fy[1];
                    var r = f(x, y);
                    return r;
                },xinit);
            });
        };

        // TODO: chainl, chainr1, chainr

        // Note: since this is many1 based, using with parse or token will require at least one
        // white space before or after - combine with many (Hutton/Meijer use many(or(spaces, comment)))
        var whitespace = function() {
            return parser.bind(many1(or(charP(" "), charP("\n"), charP("\t"))),
                function(unused) {
                    return parser.pure(identity);
                });
        };
        
        var parse = function(junk, p) {
            var junkw = function() { return junk; };
            var pw = function() { return p; };
            return _pdo([junkw, pw], function(unused, v) {
                return v;
            });
        };

        var token = function(junk, p) {
            var junkw = function() { return junk; };
            var pw = function() { return p; };

            return _pdo([pw, junkw], function(v, unused) {
                return v;
            });
        };

        var expect = function(msg, s) {
            return message(msg.pos, msg.unexpected, [s]);
        };

        var label = function(p,exp) {
            return function(s) {
                return match(p(s), {
                    emptyError: function(errmsg) {
                        return empty(error(expect(errmsg, exp)));
                    },
                    emptyOk: function(x,rest,reply) {
                        return empty(ok(x,reply.state,expect(errmsg, exp)));
                    },
                    otherwise: function(result) {
                        return result;
                    }});
            };
        };

        // mdo doesn't work where monad values in the 'ms' list are recursive calls - JS not lazy enough? or am I doing something wrong
        // so here each monadic value in ms must be a no argument function that returns the monad to be processed
        // function won't be invoked until ready
        // TODO: add guards
        var _pdo = function(ms, f, ap) {
            var autopure = ap === undefined ? true : ap;
            var _pdoInternal = function(vals,i) {
                if (i === ms.length) {
                    // WARNING, unlike mdo,pdo will automatically call pure (like the monad comprehension syntax)
                    return autopure ? parser.pure(f.apply(null, vals)) : f.apply(null,vals);
                } else {
                    return parser.bind(ms[i](), function(v) {
                        return _pdoInternal(vals.concat([v]), i+1);
                    });
                }
            };
            return _pdoInternal([], 0);
        };

        return {//item:item,
                satisfies:satisfies,
                letter:letter,
                alphanum:alphanum,
                digit:digit,
                lower:lower,
                upper:upper,
                charP:charP,
                many:many,
                many1:many1,
                sepBy1:sepBy1,
                between:between,
                sepBy:sepBy,
                chainl1:chainl1,
                stringP:stringP,
                or:or,
                choice:choice,
                whitespace:whitespace,
                parse:parse,
                token:token,
                tryP:tryP,
                label:label,
                pdo:_pdo};
    };

    return {withIdentity:withIdentity,
            stringParser: withIdentity(""),
            arrayParser: withIdentity([])};
})();
