module.exports = (function() {
    var monads = require("./jsmonads.js");
    var mdo = monads.mdo;
    var thread = monads.thread;
    var parser = monads.parser;
    //var parser = monads.stateM.withMonad(monads.list);
    var empty = parser.empty;
    var ok = parser.ok;
    var error = parser.error;
    var consumed = parser.consumed;
    var lzError = parser.lzError;
    var lzConsumed = parser.lzConsumed;
    var match = parser.match;

    if (String.prototype.tokenAt === undefined) {
        String.prototype.tokenAt = String.prototype.charAt;
    }
    if (String.prototype.rest === undefined) {
        String.prototype.rest = function() { return this.substring(1); };
    }
    if (Array.prototype.tokenAt === undefined) {
        Array.prototype.tokenAt = function(i) { return this[i]; };
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


    // This determines if we are going to aggregate as a list or as a string
    // since in JS a string is not a list of characters, we have separate identity values for the concatenation operation
    // identity is used in the many parser (and those that depend on it) to know how to aggregate values together
    // if your parser is returning a string  (e.g. parsing numbers from digits) use ""
    // otherwise use [] (for actual numbers, functions, objects, etc that are stored in an array)
    var withIdentity = function(identity) {


        /* Unconditionally consume 1 character */
        var item = function() {
            var tail = function(inp) { return inp.rest(); };

            return parser.bind(parser.update(tail),
                function(ss) {
                    if (ss.length === 0) {
                        return parser.mzero();
                    } else{
                        return parser.pure(ss.tokenAt(0));
                    }
                });

        };

        var satisfies = function(pred) {
            return function(inp) {
                var next, rest;

                if (inp.length === 0) {
                    return empty(error());
                } else {
                    next = inp.tokenAt(0);
                    return pred.call(null, next) ? 
                                consumed(ok(next, inp.rest())) : 
                                empty(error());
                }
            };
        };

        /* Parser that matches a specific character */
        var charP = function(c) {
            return satisfies(function(v) { return v === c; });
        };

        var digit = function() {
            return satisfies(function(c) { return c >= '0' && c <= '9'; });
        };

        var lower = function() {
            return satisfies(function(c) { return c >= 'a' && c <= 'z'; });
        };

        var upper = function() {
            return satisfies(function(c) { return c >= 'A' && c <= 'Z'; });
        };

        var letter = function() {
            return parser.mplus(upper(), lower());
        };

        var alphanum = function() {
            return parser.mplus(letter(), digit());
        };


        /* Parser that matches a specific string */
        var stringP = function(s) {
            if (s.length === 0) return parser.pure(""); // always strings here
            else return mdo(parser, 
                            [charP(s[0]), stringP(s.substring(1))], 
                            function(x, xs) {
                                return parser.pure(x.concat(xs)); // always strings here
                            });
        };

        var many = function(p) {
            var pwrap = function() { return p; };
            var manywrap = function() { return many(p); };
            return parser.mplus(
                _pdo([pwrap, manywrap], function(x,xs) { return cons(x,xs); }),
                parser.pure(identity)); 
                
        };

        var many1 = function(p) {
            var pwrap = function() { return p; };
            var manywrap = function() { return many(p); };// intentionally use many not recurse to many1
            return _pdo([pwrap, manywrap], function(x,xs) { return cons(x,xs); });
        };

        var sepBy1 = function(p, separator) {
            var pwrapper = function() { return p; };
            var sepwrapper = function() { return separator; };
            var yparser = _pdo([sepwrapper, pwrapper], function(unused, y) { return y; });
            var xsparser = function() { return many(yparser); };
            return _pdo([pwrapper, xsparser], function(x,xs) { return cons(x,xs); });
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

        var choice = function(p,q) {
            return function(inp) {
                var r = p.call(null, inp);
                return match(r, {
                    emptyError: function() { return q.call(null, inp); }, // if p failed, try q
                    emptyOk: function(reply) { // if p succeeds without consuming input, q is favored if it does consume input (longest match rule)
                        var r2 = q.call(null, inp);
                        return caseConsumed(r2, 
                            function onEmpty() {
                                return empty(reply);
                            },
                            function onConsumed() {
                                return r2;
                            });
                        },
                    consumedError: function() { return r; }, // if p consumes data it is chosen
                    consumedOk: function() { return r; } // if p consumes data it is chosen
                });
            };
        };

        var or = function(/* ordered list of parsers */) {
            var orargs = Array.prototype.slice.call(arguments,0);
            return orargs.reduce(choice);
            //return function(inp) {
                //return orargs.reduce(choice);
            //};
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
                    var r = f.call(null, x, y);
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

        return {item:item,
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
                pdo:_pdo};
    };

    return {withIdentity:withIdentity,
            stringParser: withIdentity(""),
            arrayParser: withIdentity([])};
})();
