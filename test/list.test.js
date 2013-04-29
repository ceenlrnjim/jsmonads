exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var list = monads.list;

    var v = list.pure(100);
    test.ok(v.length === 1);
    test.ok(v[0] === 100);
    test.done();
};

exports.testMappend = function(test) {
    var monads = require("../src/jsmonads.js");
    var list = monads.list;
    var lone = [1,1,1];
    var ltwo = [2,2,2];
    var v = list.mappend(lone,ltwo);
    test.ok(v.length === 6);
    test.ok(v[0] === 1);
    test.ok(v[1] === 1);
    test.ok(v[2] === 1);
    test.ok(v[3] === 2);
    test.ok(v[4] === 2);
    test.ok(v[5] === 2);
    test.done();
};
exports.testMconcat = function(test) {
    var monads = require("../src/jsmonads.js");
    var list = monads.list;

    var larr = [[1],[2,2], [3,3,3]];
    var res = list.mconcat(larr);
    var predicted = [1,2,2,3,3,3];
    for (var i=0;i<predicted.length;i++) {
        test.ok(res[i] === predicted[i]);
    }
    test.done();
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var list = monads.list;
    var predicted = [1,2,3,2,4,6,3,6,9];
    var res = list.bind([1,2,3], function(n) {
        return [n*1, n*2, n*3];
    });

    for (var i=0;i<predicted.length;i++) {
        test.ok(res[i] === predicted[i]);
    }

    test.done();
};
