exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var writer = monads.writer;
    var list = monads.list;

    var v = writer.withMonoid(list).pure(100);
    test.ok(v[0] === 100);
    test.ok(v[1].length === 0);
    test.done();
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var writer = monads.writer;
    var list = monads.list;

    var w = [100, ["Initial value is 100"]];

    var res = writer.withMonoid(list).bind(w, function(v) {
        return [v*2, ["Doubled value " + v]];
    });
    test.ok(res[0] === 200);
    test.ok(res[1][0] === "Initial value is 100");
    test.ok(res[1][1] === "Doubled value 100");

    test.done();
};
