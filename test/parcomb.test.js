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
    console.log(r);
    checkFirstResult(test, r, "123", "abc456");

    r = p("1abc");
    checkFirstResult(test,r,"1","abc");

    r = p("abc123");
    checkFirstResult(test,r,"","abc123");

    test.done();
};
