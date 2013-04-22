exports.testPure = function(test) {
    var promise = require("../src/promise.js");
    var p = promise.pure(100);
    p.then(function(v) {
        test.ok(v === 100);
        test.done();
    });
}

exports.testResolve = function(test) {
    var promise = require("../src/promise.js");
    var p = new promise.Promise();
    p.then(function(v) {
        test.equal(v, 100, "didn't get 100");
        test.done();
    });

    p.resolve(100);
};

exports.testBind = function(test) {
    var promise = require("../src/promise.js");
    var p = new promise.Promise();

    p.bind(function(v) {
        var mypromise = new promise.Promise();
        setTimeout(function() { mypromise.resolve(v*2)}, 500);
        return mypromise;
    }).then(function(v) {
        test.equal(v, 200, "incorrect value");
        test.done();
    });

    p.resolve(100);
};
