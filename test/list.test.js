exports.testMatch = function(test) {
    var list = require("../src/list.js");
    new list.List([1,2,3]).match(function(v) {
        test.ok(v[0] === 1);
        test.ok(v[1] === 2);
        test.ok(v[2] === 3);
    });
    test.done();
};

//exports.test = function(test) {
    //var maybe = require("../src/list.js");
    //test.done();
//};
