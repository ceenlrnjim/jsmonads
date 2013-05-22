var rt = function() { return true; };
var rf = function() { return false; };
var checkFirstResult = function(test, parser, r, val, state) {

    var av,as;
    var matches = parser.match(r, {
        emptyOk: function(x,rest) { av=x; as=rest; return x === val && rest === state; },
        emptyError: function() { return false; },
        consumedOk: function(x,rest) { av=x; as=rest; return x === val && rest === state; },
        consumedError: function() { return false; }});
        
    
    test.ok(matches, "value: expected " + val + "," + state + " got " + av + "," + as);
};

/*
exports.testItem = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var r = pc.item()("a");
    checkFirstResult(test,r,"a","");

    r = pc.item()("abc");
    checkFirstResult(test,r,"a","bc");
    
    test.ok(pc.item()("").length === 0);
    test.done();
};
*/

exports.testSatisfies = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");

    var p = pc.satisfies(function(c) { return c === '1' || c === '2' || c === '3'; });
    var r = p.call(null, "111")
    console.log(r);
    checkFirstResult(test, parser, r, "1", "11");
    
    r = p.call(null, "211");
    checkFirstResult(test, parser,r,"2","11");

    r = p.call(null, "411");
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testCharP = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");

    var r = pc.charP("J")("Jim");
    checkFirstResult(test, parser,r,"J","im");

    r = pc.charP("J")("Bill");
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testStringP = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");

    var r = pc.stringP("Jim")("Jim Kirkwood");
    checkFirstResult(test, parser,r,"Jim", " Kirkwood");

    r = pc.stringP("Jim")("Jane Smith");
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testChoice = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");

    var d = pc.digit();
    var u = pc.upper();
    var p = pc.choice(d,u);
    checkFirstResult(test, parser, p("123"), "1", "23");
    checkFirstResult(test, parser, p("ABC"), "A", "BC");
    test.ok(!parser.caseReply(p("abc"), rt, rf));
    test.done();
};

exports.testOr = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");

    var d = pc.digit();
    var u = pc.upper();
    var l = pc.lower();
    //var p = pc.choice(pc.choice(d,u),l);
    var p = pc.or(d,u,l);
    checkFirstResult(test, parser, p("123"), "1", "23");
    checkFirstResult(test, parser, p("ABC"), "A", "BC");
    checkFirstResult(test, parser, p("abc"), "a", "bc");
    test.ok(!parser.caseReply(p("!abc"), rt, rf));
    test.done();
};


/*

exports.testMany = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var p = pc.many(pc.digit());
    var r = p("123abc456");
    checkFirstResult(test, r, "123", "abc456");

    r = p("1abc");
    checkFirstResult(test,r,"1","abc");

    r = p("abc123");
    checkFirstResult(test,r,"","abc123");

    test.done();
};

exports.testMany1 = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    
    var p = pc.many1(pc.lower());
    var r = p("abc123");
    checkFirstResult(test,r,"abc","123");

    r = p("123abc");
    test.ok(r.length === 0);

    test.done();
};

exports.testSepBy1 = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").arrayParser;

    var p = pc.sepBy1(pc.digit(), pc.charP(","));
    var r = p("1,2,3,4");

    test.ok(r[0][0][0] === "1");
    test.ok(r[0][0][1] === "2");
    test.ok(r[0][0][2] === "3");
    test.ok(r[0][0][3] === "4");
    test.ok(r[0][1] === "");

    r = p("1,2,abc");
    test.ok(r[0][1] === ",abc");

    r = p("Abcde");
    test.ok(r.length === 0);

    test.done();
};
exports.testSepBy = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var p = pc.sepBy(pc.digit(), pc.charP(","));
    var r = p("1,2,3,4");

    test.ok(r[0][0] === "1234");
    test.ok(r[0][1] === "");

    r = p("1,2,abc");
    test.ok(r[0][0] === "12");
    test.ok(r[0][1] === ",abc");

    r = p("Abcde");
    test.ok(r[0][0] === "");
    test.ok(r[0][1] === "Abcde");

    test.done();

};
exports.testBetween = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var p = pc.between(pc.charP("("), pc.many(pc.lower()), pc.charP(")"));
    var r = p("(abcde)456");
    checkFirstResult(test,r,"abcde","456");

    r = p("(abc45)");
    test.ok(r.length === 0);

    r = p("(abc");
    test.ok(r.length === 0);

    test.done();
};

exports.testChainl1 = function(test) {
    var monads = require("../src/jsmonads.js");
    var pcs = require("../src/parcomb.js").stringParser;
    var pca = require("../src/parcomb.js").arrayParser;
    var parser = monads.parser;

    var op = parser.bind(pca.charP("+"), function(plus) {
        return parser.pure(function(a,b) { return a + b; });
    });

    var num = parser.bind(pcs.many1(pcs.digit()), function(n) {
        return parser.pure(eval(n));
    });

    var p = pca.chainl1(num, op);
    var r = p("1+2+3");
    checkFirstResult(test,r,6,"");

    test.done();
};
*/
