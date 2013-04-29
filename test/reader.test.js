exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var reader = monads.reader;

    var r = reader.pure(100);
    test.ok(r() === 100);
    test.done();
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var reader = monads.reader;

    // TODO: need to test with an environment that doesn't support mutation
};
