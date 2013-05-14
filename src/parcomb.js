// TODO: can I apply the monad library to build a parser/combinator library
// Then, can I build a parser combinator library that parses JS objects instead of strings
// for making javascript DSLs?
//

module.exports = (function() {
    var monads = require("./jsmonads.js");
    var parser = monads.parser;
    var mdo = monads.mdo;
    var thread = monads.thread;

    /* Unconditionally consume 1 character */
    var item = function() {
        return function(inp) {
            //console.log("item> parsing " + inp);
            if (inp.length === 0) return [];
            else return [ [inp.charAt(0), inp.substring(1)] ];
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
        if (s.length === 0) return parser.pure("");
        else return mdo(parser, 
                        [charP(s[0]), stringP(s.substring(1))], 
                        function(x, xs) {
                            return parser.pure(x + xs); // TODO: use a function to allow parsing something other than strings
                        });
    };

    var many = function(p) {
        // mdo doesn't work here because putting many(p) in the list of monads causes unbroken recursion
        return parser.mplus(
            parser.bind(p(), function(x) {
                return parser.bind(many(p), function(xs) {
                    return parser.pure(x + xs);
                });
            }), 
            parser.pure(""));
    };

    var many1 = function(p) {
        // mdo doesn't work here because putting many(p) in the list of monads causes unbroken recursion
        return parser.bind(p(), function(x) {
                return parser.bind(many(p), function(xs) {
                    return parser.pure(x + xs);
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
})();
