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

