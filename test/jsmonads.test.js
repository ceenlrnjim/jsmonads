exports.testMdo = function(test) {
    var monads = require("../src/jsmonads.js");
    
    var inv = function(a) {
        return a !== 0 ? 1/a : null;
    };

    var inc = function(a) {
        return a+1;
    };

    var v = monads.mdo(monads.maybe, [0,1,2], function(a,b,c) {
        return monads.maybe.pure(a+b+c);
    });
    test.ok(v === 3);

    v = monads.mdo(monads.writer.withMonoid(monads.list), [[0,["zero seed"]],[1,["one seed"]],[2,["two seed"]]],
    function(a,b,c) {
        return [a+b+c, ["added a, b, and c"]];
    });
    test.ok(v[0] === 3);
    test.ok(v[1].length === 4);
    test.ok(v[1][0] === "zero seed");
    test.ok(v[1][3] === "added a, b, and c");
    test.done();
};
