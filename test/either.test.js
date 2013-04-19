exports.testMatchRight = function(test) {
    var either = require("../src/either.js");
    var rightInvoked = false;
    var leftInvoked = false;
    var value;

    new either.Right(100).match(function(v) {
        value = v;
        leftInvoked = true;
    }, function(v) {
        value = v;
        rightInvoked = true;
    });

    test.ok(rightInvoked);
    test.ok(!leftInvoked);
    test.ok(value === 100);
    test.done();

};

exports.testMatchLeft = function(test) {
    var either = require("../src/either.js");
    var rightInvoked = false;
    var leftInvoked = false;
    var value;

    new either.Left(100).match(function(v) {
        value = v;
        leftInvoked = true;
    }, function() {
        value = v;
        rightInvoked = true;
    });

    test.ok(!rightInvoked);
    test.ok(leftInvoked);
    test.ok(value === 100);
    test.done();
};

exports.testChainedCallbacks = function(test) {
    var either = require("../src/either.js");
    var rightInvoked = false;
    var leftInvoked = false;

    new either.Right(100).right(function(v) { rightInvoked = true;}).left(function() {leftInvoked = true;});
    test.ok(rightInvoked);
    test.ok(!leftInvoked);

    rightInvoked = false;
    leftInvoked = false;

    new either.Left(100).right(function(v) { rightInvoked = true;}).left(function() {leftInvoked = true;});
    test.ok(!rightInvoked);
    test.ok(leftInvoked);

    rightInvoked = false;
    leftInvoked = false;

    new either.Left(100).left(function() {leftInvoked = true;}).right(function(v) { rightInvoked = true;});
    test.ok(!rightInvoked);
    test.ok(leftInvoked);

    rightInvoked = false;
    leftInvoked = false;

    new either.Right(100).left(function() {leftInvoked = true;}).right(function(v) { rightInvoked = true;});
    test.ok(rightInvoked);
    test.ok(!leftInvoked);

    test.done();
};

exports.testPure = function(test) {
    var either = require("../src/either.js");
    var value;

    either.pure(100).right(function(v) { value = v; });

    test.ok(value === 100);
    test.done();

};

exports.testBind = function(test) {
    var either = require("../src/either.js");
    var r = new either.Right(100);
    var l = new either.Left("failed up front");

    // some dummy monadic function
    var mf = function(v) {
        if (v > 0) {
            return new either.Right(v*2);
        } else {
            return new either.Left("can't do negatives");
        }
    }

    var rresult = either.bind(r, mf);
    var lresult = either.bind(l, mf);

    test.ok(rresult.match(undefined, function(v) { return v; }) === 200);
    test.ok(lresult.match(function(v) { return v; }) === "failed up front");

    rresult = r.bind(mf);
    lresult = l.bind(mf);

    test.ok(rresult.match(undefined, function(v) { return v; }) === 200);
    test.ok(lresult.match(function(v) { return v; }) === "failed up front");
    test.done();
};
