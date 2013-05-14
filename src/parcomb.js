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

    /* Parser that matches a specific string */
    var stringP = function(s) {
        if (s.length === 0) return parser.pure("");
        else return mdo(parser, [charP(s[0]), stringP(s.substring(1))], 
            function(x, xs) {
                return parser.pure(x + xs);
            });
    };

    return {item:item,
            satisfies:satisfies,
            charP:charP,
            stringP:stringP};
})();