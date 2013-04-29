// Can I "lift" these monadic functions to use lists of callbacks?

exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var promise = monads.promise;

    var p = promise.pure(100);
    p(function(v) {
        test.ok(v === 100);
        test.done();
    });
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var promise = monads.promise;

     var fn = function(v) {
        return function(cb) {
            setTimeout(function() { cb.call(null, v + 1); },10);
        };
    };

    promise.bind(fn(100), fn)(function(v) {
        test.ok(v === 102);
        test.done();
    });
}

exports.testLawOne = function(test) {
    var monads = require("../src/jsmonads.js");
    var promise = monads.promise;

    var fn = function(v) {
        return function(cb) {
            setTimeout(function() { cb.call(null, v + 1); },10);
        };
    };

    fn(100)(function(v) {
        test.ok(v === 101);
    });

    promise.bind(promise.pure(100), fn)(function(v) {
        test.ok(v === 101);
        test.done();
    });
};

exports.testLawTwo = function(test) {
    var monads = require("../src/jsmonads.js");
    var promise = monads.promise;

    var fn = function(v) {
        return function(cb) {
            setTimeout(function() { cb.call(null, v + 1); },10);
        };
    };

    var m = fn(100);

    promise.bind(m, promise.pure)(function(v) {
        test.ok(v === 101);
        test.done();
    });
};

exports.testLawThree = function(test) {
    var monads = require("../src/jsmonads.js");
    var promise = monads.promise;

    var fn = function(v) {
        return function(cb) {
            setTimeout(function() { cb.call(null, v + 1); },10);
        };
    };

    var fn2 = function(v) {
        return function(cb) {
            setTimeout(function() { cb.call(null, v * -1); },10);
        };
    };


    var m = fn(100);

    promise.bind(promise.bind(m, fn), fn2)(function(v) {
        test.ok(v === -102);
    });

    promise.bind(m, function(x) {
        return promise.bind(fn(x), fn2);
    })(function(v) {
        test.ok(v === -102);
        test.done();
    });
};

exports.testMultipleCallbacks = function(test) {
    var monads = require("../src/jsmonads.js");
    var promise = monads.promise;

    var fn = function(v) {
        return function(cb) {
            setTimeout(function() { cb.call(null, v + 1); },10);
        };
    };

    var callbacks = [function(a) { console.log("A" + a); },
                     function(b) { console.log("B" + b);},
                     function(c) { console.log("C" + c);}];

    monads.lift(monads.list, fn(100), callbacks);
    test.done();
};
