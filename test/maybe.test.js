exports.testChaining = function(test) {
    var monads = require("../src/jsmonads.js");
    var maybe = monads.maybe;

    var inc = function(v) { 
        if (typeof v !== 'number') {
            throw new TypeError("Cannot increment non-number");
        } else {
            return v+1; 
        }
    };

    test.equal(monads.thread(maybe, 0, inc, inc, inc, inc), 4, "didn't get 4");
    test.equal(monads.thread(maybe, "bill", inc, inc, inc), null, "didn't get null");

    test.done();
};

exports.testLift = function(test) {
    var monads = require("../src/jsmonads.js");
    var maybe = monads.maybe;

    var add = function(a,b) {
        return a + b;
    }

    test.ok(monads.lift(maybe, add, 1, 2) === 3);
    test.ok(monads.lift(maybe, add, null, 2) === null);
    test.ok(monads.makeMonadic(maybe, add, undefined, 2) === null);
    test.ok(monads.makeMonadic(maybe, add, 2, 2) === 4);
    test.done();
};

exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var maybe = monads.maybe;

    test.equal(maybe.pure(100), 100, "just failed");
    test.equal(maybe.pure(undefined), null, "nothing with undefined failed");
    test.equal(maybe.pure(null), null, "nothing with null failed");

    test.done();
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var maybe = monads.maybe;

    // some dummy monadic function
    var invert = function(v) {
        if (v === 0) {
            return null;
        } else {
            return 1/v;
        }
    }

    test.equal(maybe.bind(10, invert), 0.1, "just failed");
    test.equal(maybe.bind(null, invert), undefined, "nothing failed");
    test.done();
};

exports.testFail = function(test) {
    var monads = require("../src/jsmonads.js");
    var maybe = monads.maybe;
    test.equal(maybe.fail("failed"), null, "unexpected fail result");
    test.done();
};
