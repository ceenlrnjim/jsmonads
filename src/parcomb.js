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
            if (s.length === 0) return parser.pure(identity); // TODO: need to pure based on whether my source is array or string
            else return mdo(parser, 
                            [charP(s[0]), stringP(s.substring(1))], 
                            function(x, xs) {
                                return parser.pure(xs.cons(x));
                            });
        };

        var many = function(p) {
            // mdo doesn't work here because putting many(p) in the list of monads causes unbroken recursion
            return parser.mplus(
                parser.bind(p(), function(x) {
                    return parser.bind(many(p), function(xs) {
                        return parser.pure(xs.cons(x));
                    });
                }), 
                parser.pure(identity)); // TODO: need to pure based on whether my source is array or string
        };

        var many1 = function(p) {
            // mdo doesn't work here because putting many(p) in the list of monads causes unbroken recursion
            return parser.bind(p(), function(x) {
                    return parser.bind(many(p), function(xs) {
                        return parser.pure(xs.cons(x));
                    });
                });
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
                stringP:stringP};
    };

    return {withIdentity:withIdentity,
            stringParser: withIdentity(""),
            arrayParser: withIdentity([])};
})();
