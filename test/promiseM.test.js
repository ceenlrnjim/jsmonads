var monads = require("../src/jsmonads.js");
var pm = monads.promiseM;
var either = monads.either;
var m = pm.withMonad(either);

exports.testPure = function(test) {
    var mv = m.pure(100);

    mv(function(efn) {
        efn(function () {
            test.ok(false); // fail
            test.done();
        }, function (v) {
            test.ok(100 === v);
            test.done();
        });
    });
};

exports.testBind = function(test) {
    var mv = m.pure(100);

    var mv2 = m.bind(mv, function(v) {
        return m.pure(v*2);
    });

    mv2(function(f) {
        f(function() {
            test.ok(false); // fail
        },
        function (v) {
            test.ok(200 === v);
        });
    });

    var mv4 = function(cb) {
        setTimeout(function () {
            cb.call(null,either.right(100));
        },1000);
    };

    m.bind(mv4, function(v) {
        return m.pure(v*2);
    })(function (cbv) {
        cbv(function() { test.ok(false); test.done(); },
            function(v) { test.ok(v === 200); test.done();});

    });

};

exports.testLift = function(test) {
    var mv3 = m.lift(either.left("fail"));

    mv3(function(f) {
        f(function(r) {
            test.ok(r === "fail");
            test.done();
        },
        function() {
            test.ok(false);
            test.done();
        });
    });
};
