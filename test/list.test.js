exports.testMatch = function(test) {
    var list = require("../src/list.js");
    new list.List([1,2,3]).match(function(v) {
        test.ok(v[0] === 1);
        test.ok(v[1] === 2);
        test.ok(v[2] === 3);
    });
    test.done();
};

exports.testPure = function(test) {
    var list = require("../src/list.js");
    list.pure(100).match(function(v) { 
        test.ok(v.length === 1);
        test.ok(v[0] === 100);
    });
    test.done();
};

exports.testMappend = function(test) {
    var list = require("../src/list.js");
    var lone = new list.List([1,1,1]);
    var ltwo = new list.List([2,2,2]);
    lone.mappend(ltwo).match(function(v) {
        test.ok(v.length === 6);
        test.ok(v[0] === 1);
        test.ok(v[1] === 1);
        test.ok(v[2] === 1);
        test.ok(v[3] === 2);
        test.ok(v[4] === 2);
        test.ok(v[5] === 2);
    });
    test.done();
};

//exports.test = function(test) {
    //var list = require("../src/list.js");
    //test.done();
//};
