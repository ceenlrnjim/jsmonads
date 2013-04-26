
exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var either = monads.either;

    either.pure(100)(function(e) { test.ok(false, "error invoked"); },
                     function(v) { test.ok(v === 100, "value wasn't 100"); });
    test.done();
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var either = monads.either;

    // some dummy monadic function
    var inc = function(v) {
        if (typeof v === 'number') {
            return either.right(v+1);
        } else {
            return either.left("Can only support numbers");
        }
    };

    test.ok(either.bind(either.right(100), inc)(function (e) { return false; }, function(v) { return v === 101; }));
    test.ok(either.bind(either.left("error"), inc)(function (e) { return e === "error"; }, function(v) { return false; }));
    test.done();
};

exports.testFail = function(test) {
    var monads = require("../src/jsmonads.js");
    var either = monads.either;
    test.ok(either.fail("error")(function (e) { return e === "error"; }, function(v) { return false; }));
    test.done();
};

exports.testChaining = function(test) {
    var monads = require("../src/jsmonads.js");
    var either = monads.either;

    var inc = function(v) { 
        if (typeof v !== 'number') {
            return either.left("non-number value specified");
        } else {
            return either.right(v+1); 
        }
    };

    var ev = function(v) { return v; };

    test.ok(monads.domonad(either, either.right(0), inc, inc, inc, inc)(ev,ev) === 4);
    test.ok(monads.domonad(either, either.left("bad"), inc, inc, inc, inc)(ev,ev) === "bad");

    test.done();
};

exports.testLift = function(test) {
    var monads = require("../src/jsmonads.js");
    var either = monads.either;

    var add = function(a,b) {
        return a + b;
    };
    var ev = function(v) { return v; };

    test.ok(monads.lift(either, add, either.right(1), either.right(2))(ev,ev) === 3);
    test.ok(monads.lift(either, add, either.left("fail"), either.right(2))(ev,ev) === "fail");
    test.ok(monads.makeMonadic(either, add, 2, 2)(ev,ev) === 4);
    test.done();
};

