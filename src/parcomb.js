// TODO: can I apply the monad library to build a parser/combinator library
// Then, can I build a parser combinator library that parses JS objects instead of strings
// for making javascript DSLs?
//

module.exports = (function() {
    var monads = require("./jsmonads.js");
    var parser = monads.parser;
    var mdo = monads.mdo;
    var thread = monads.thread;

    if (String.prototype.tokenAt === undefined) {
        String.prototype.tokenAt = String.prototype.charAt;
    }
    if (String.prototype.rest === undefined) {
        String.prototype.rest = function() { return this.substring(1); };
    }
    if (String.prototype.cons === undefined) {
        String.prototype.cons = function(x) { return x.concat(this); };
    }
    if (Array.prototype.tokenAt === undefined) {
        Array.prototype.tokenAt = function(i) { return this[i]; };
    }
    if (Array.prototype.rest === undefined) {
        Array.prototype.rest = function() { return this.slice(1); };
    }
    if (Array.prototype.cons === undefined) {
        Array.prototype.cons = function(x) {
            var r = new Array(this.length + 1);
            r[0] = x;
            for (var i=0, n=this.length; i<n;i++) {
                r[i+1] = this[i];
            }
            return r;
        };
    }

    var withIdentity = function(identity) {


        /* Unconditionally consume 1 character */
        var item = function() {
            return function(inp) {
                //console.log("item> parsing " + inp);
                if (inp.length === 0) return [];
                else return [ [inp.tokenAt(0), inp.rest()] ];
            };
        };

        var satisfies = function(pred) {
            return parser.bind(item(), function(c) {
                return pred.call(null, c) ? parser.pure(c) : parser.mzero();
            });
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
            if (s.length === 0) return parser.pure(identity);
            else return mdo(parser, 
                            [charP(s[0]), stringP(s.substring(1))], 
                            function(x, xs) {
                                return parser.pure(xs.cons(x));
                            });
        };

        var many = function(p) {
            var pwrap = function() { return p; };
            var manywrap = function() { return many(p); };
            return parser.mplus(
                _pdo([pwrap, manywrap], function(x,xs) { return xs.cons(x); }),
                parser.pure(identity));
                
        };

        var many1 = function(p) {
            var pwrap = function() { return p; };
            var manywrap = function() { return many(p); };
            return _pdo([pwrap, manywrap], function(x,xs) { return xs.cons(x); });
        };

        var sepBy1 = function(p, separator) {
            var pwrapper = function() { return p; };
            var sepwrapper = function() { return separator; };
            var yparser = _pdo([sepwrapper, pwrapper], function(unused, y) { return y; });
            var xsparser = function() { return many(yparser); };
            return _pdo([pwrapper, xsparser], function(x,xs) { return xs.cons(x); });
        };

        var between = function(open, p, close) {
            // manual laziness
            var openw = function() { return open; };
            var pw = function() { return p; };
            var closew = function() { return closew; };

            return _pdo([openw, pw, closew], function(una, x, unb) { return x; });
        };

        var sepBy = function(p, sep) {
            return parser.mplus(sepBy1(p, sep), parser.pure([[]]));
        };

        var or = function(/* ordered list of parsers */) {
            var orargs = arguments;
            return function(inp) {
                var r;
                for (var i=0,n=orargs.length;i<n;i++) {
                    r = orargs[i].call(null, inp);
                    if (r.length !== 0) {
                        return r;
                    }
                }
                return [];
            };
        };


        // TODO: something here isn't right
        var chainl1 = function(p, op) {
            var pw = function() { return p; };
            var opw = function() { return op; };
            var fysparser = _pdo([opw, pw], function(f,y) { return [f,y]; });
            var fysparserw = function() { return many(fysparser); };

            return _pdo([pw,fysparserw], function(xinit, fys) {
                console.log("fys = " + fys + " (" + fys.length + ")");
                fys.reduce(function(x, fy) {
                    console.log(" - fy = " + fy);
                    var f = fy[0];
                    var y = fy[1];
                    return f.call(null, x, y);
                },xinit);
            });
        };

        // mdo doesn't work where monad values in the 'ms' list are recursive calls - JS not lazy enough? or am I doing something wrong
        // so here each monadic value in ms must be a no argument function that returns the monad to be processed
        // function won't be invoked until ready
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
                pdo:_pdo};
    };

    return {withIdentity:withIdentity,
            stringParser: withIdentity(""),
            arrayParser: withIdentity([])};
})();
