exports.testMatchJust = function(test) {
    var maybe = require("../src/maybe.js");
    var justInvoked = false;
    var nothingInvoked = false;
    var value;

    new maybe.Just(100).match(function(v) {
        value = v;
        justInvoked = true;
    }, function() {
        nothingInvoked = true;
    });

    test.ok(justInvoked);
    test.ok(!nothingInvoked);
    test.ok(value === 100);
    test.done();

};

exports.testMatchNothing = function(test) {
    var maybe = require("../src/maybe.js");
    var justInvoked = false;
    var nothingInvoked = false;
    var value;

    new maybe.Nothing().match(function(v) {
        value = v;
        justInvoked = true;
    }, function() {
        nothingInvoked = true;
    });

    test.ok(!justInvoked);
    test.ok(nothingInvoked);
    test.ok(value === undefined);
    test.done();
};

exports.testChainedCallbacks = function(test) {
    var maybe = require("../src/maybe.js");
    var justInvoked = false;
    var nothingInvoked = false;

    new maybe.Just(100).just(function(v) { justInvoked = true;}).nothing(function() {nothingInvoked = true;});
    test.ok(justInvoked);
    test.ok(!nothingInvoked);

    justInvoked = false;
    nothingInvoked = false;

    new maybe.Nothing().just(function(v) { justInvoked = true;}).nothing(function() {nothingInvoked = true;});
    test.ok(!justInvoked);
    test.ok(nothingInvoked);

    justInvoked = false;
    nothingInvoked = false;

    new maybe.Nothing().nothing(function() {nothingInvoked = true;}).just(function(v) { justInvoked = true;});
    test.ok(!justInvoked);
    test.ok(nothingInvoked);

    justInvoked = false;
    nothingInvoked = false;

    new maybe.Just(100).nothing(function() {nothingInvoked = true;}).just(function(v) { justInvoked = true;});
    test.ok(justInvoked);
    test.ok(!nothingInvoked);

    test.done();
};

exports.testPure = function(test) {
    var maybe = require("../src/maybe.js");
    var value;

    maybe.pure(100).just(function(v) { value = v; });

    test.ok(value === 100);
    test.done();

};

exports.testBind = function(test) {
    var maybe = require("../src/maybe.js");
    var j = new maybe.Just(100);
    var n = new maybe.Nothing();

    // some dummy monadic function
    var mf = function(v) {
        if (v > 0) {
            return new maybe.Just(v*2);
        } else {
            return new maybe.Nothing();
        }
    }

    var jresult = maybe.bind(j, mf);
    var nresult = maybe.bind(n, mf);

    test.ok(jresult.match(function(v) { return v; }) === 200);
    test.ok(nresult.match(undefined, function() { return "nothing"; }) === "nothing");

    jresult = j.bind(mf);
    nresult = n.bind(mf);

    test.ok(jresult.match(function(v) { return v; }) === 200);
    test.ok(nresult.match(undefined, function() { return "nothing"; }) === "nothing");
    test.done();
};

exports.testFail = function(test) {
    var maybe = require("../src/maybe.js");
    var failed = false;
    maybe.fail("failed").nothing(function() { failed = true; });
    test.ok(failed);
    test.done();
};
