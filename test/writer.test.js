exports.testMatch = function(test) {
    var writer = require("../src/writer.js");
    var list = require("../src/list.js");
    var w = new writer.Writer(100, new list.List(["Initial value is 100"]));
    w.match(function(v,m) {
        test.ok(v === 100);
        test.ok(m.contents[0] === "Initial value is 100");
    });

    w.withValue(function(v) {
        test.ok(v === 100);
    });

    w.withMonoid(function(v) {
        test.ok(v.contents[0] === "Initial value is 100");
    });
    test.done();
};

exports.testBind = function(test) {
    var writer = require("../src/writer.js");
    var list = require("../src/list.js");
    var w = new writer.Writer(100, new list.List(["Initial value is 100"]));

    w.bind(function(v) {
        return new writer.Writer(v*2, new list.List(["Doubled value " + v]));
    }).match(function (v,m) {
        test.ok(v === 200);
        test.ok(m.contents[0] === "Initial value is 100");
        test.ok(m.contents[1] === "Doubled value 100");
    });

    test.done();
};
