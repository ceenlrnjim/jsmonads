exports.testPure = function(test) {
    var parser = require("../src/jsmonads.js").parser;
    var v = parser.pure(10);

    parser.match(v(parser.state("abc", parser.position(1,1))),{
        emptyOk: function(x,rest) {
            test.ok(x === 10);
            test.ok(rest === "abc");
        },
        otherwise: function() { 
            test.ok(false);
        }});

    test.done();
};

exports.testBind = function(test) {
    var parser = require("../src/jsmonads.js").parser;
    var pc = require("../src/parcomb.js").stringParser;
    var newstate = function(input,line,col) {
        return parser.state(input, parser.position(line,col));
    };

    var p = pc.digit()
    var pb = parser.bind(pc.digit(), pc.digit);

    var fail = function(msg) { return function(reply) { console.log(reply); test.ok(false,msg); } };
    var pass = function(reply) { console.log(reply); test.ok(true); };

    parser.match(pb(newstate("123",1,1)), {
        emptyOk: fail("emptyOk"),
        emptyError: fail("emptyError"),
        consumedOk: function(x, rest) {
            test.ok(x === "2", "X expected 2 but got " + x);
            test.ok(rest === "3", "rest expected 3 but got " + rest);
        },
        consumedError: fail("consumedError")});

    parser.match(pb(newstate("a3",1,1)), {
        emptyOk: fail("emptyOk"),
        emptyError: pass,
        consumedOk: fail("consumedOk"),
        consumedError: fail("consumedError")});

    parser.match(pb(newstate("1a3")), {
        emptyOk: fail("emptyOk"),
        emptyError: fail("emptyError"),
        consumedOk: fail("consumedOk"),
        consumedError: pass});



    test.done();
};
