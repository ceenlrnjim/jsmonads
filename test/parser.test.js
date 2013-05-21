var testResult = function(test, parser, result, x, rest) {
};

exports.testPure = function(test) {
    var parser = require("../src/jsmonads.js").parser;
    var v = parser.pure(10);

    parser.caseConsumed(parser.pure(10)("abc"),
        function empty(reply) {
            test.ok(true);
            parser.caseReply(reply,
                function ok(x, rest) {
                    test.ok(x === 10);
                    test.ok(rest === "abc");
                }, 
                function error() {
                    test.ok(false); // fail
                });
        },
        function consumed() {
            test.ok(false); // fail
        });

    test.done();
};

exports.testBind = function(test) {
    var parser = require("../src/jsmonads.js").parser;
    var pc = require("../src/parcomb.js").stringParser;

    var p = pc.digit()
    var pb = parser.bind(pc.digit(), pc.digit);

    var fail = function(msg) { return function(reply) { console.log(reply); test.ok(false,msg); } };
    var pass = function(reply) { console.log(reply); test.ok(true); };

    parser.match(pb("123"), {
        emptyOk: fail("emptyOk"),
        emptyError: fail("emptyError"),
        consumedOk: function(x, rest) {
            test.ok(x === "2", "X expected 2 but got " + x);
            test.ok(rest === "3", "rest expected 3 but got " + rest);
        },
        consumedError: fail("consumedError")});

    parser.match(pb("a3"), {
        emptyOk: fail("emptyOk"),
        emptyError: pass,
        consumedOk: fail("consumedOk"),
        consumedError: fail("consumedError")});

    parser.match(pb("1a3"), {
        emptyOk: fail("emptyOk"),
        emptyError: fail("emptyError"),
        consumedOk: fail("consumedOk"),
        consumedError: pass});



    test.done();
};
