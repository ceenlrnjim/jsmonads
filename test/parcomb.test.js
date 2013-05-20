var checkFirstResult = function(test, r, val, state) {
    test.ok(r[0].length === 2);
    test.ok(r[0][0] === val);
    test.ok(r[0][1] === state);
};

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

exports.testSatisfies = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var p = pc.satisfies(function(c) { return c === '1' || c === '2' || c === '3'; });
    var r = p.call(null, "111")
    checkFirstResult(test, r, "1", "11");
    
    r = p.call(null, "211");
    checkFirstResult(test,r,"2","11");

    r = p.call(null, "411");
    test.ok(r.length === 0);

    test.done();
};

exports.testCharP = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var r = pc.charP("J")("Jim");
    checkFirstResult(test,r,"J","im");

    r = pc.charP("J")("Bill");
    test.ok(r.length === 0);

    test.done();
};

exports.testStringP = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var r = pc.stringP("Jim")("Jim Kirkwood");
    checkFirstResult(test,r,"Jim", " Kirkwood");

    r = pc.stringP("Jim")("Jane Smith");
    test.ok(r.length === 0);

    test.done();
};

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
exports.testOr = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var p = pc.or(pc.many1(pc.digit()), pc.many1(pc.upper()));
    var r = p("123");
    checkFirstResult(test,r,"123","");
    
    r = p("ABC");
    checkFirstResult(test,r,"ABC","");

    r = p("A1B2");
    checkFirstResult(test,r,"A","1B2");

    r = p("aBC123");
    test.ok(r.length === 0);

    test.done();
};
