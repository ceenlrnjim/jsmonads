exports.testPure = function(test) {
    var monads = require("../src/jsmonads.js");
    var state = monads.state;
    var s = state.pure(99);
    var v = s(100);
    test.ok(v[0] === 99);
    test.ok(v[1] === 100);
    test.done();
};

exports.testBind = function(test) {
    var monads = require("../src/jsmonads.js");
    var state = monads.state;

    var push = function(v) {
        return function(st) {
            return [null, [v].concat(st)];
        };
    };

    var pop = function() {
        return function(st) {
            var newState = new Array(st.length - 1);
            for (var i=0;i<newState.length;i++) {
                newState[i] = st[i+1];
            }
            return [st[0], newState];
        };
    };

    var pusher = function(v) {
        return function() {
            return push(v);
        };
    };

    // State [] int 
    // push/bind/pop builds a function (runState) that has the effect of applying push 3, pop, and pop to some state
    // executing that function against a state [5,8,2,1] returns the final state after all those functions
    var result = monads.domonad(state, push(3), pop, pop)([5,8,2,1])
    test.ok(result[0] === 5); 
    test.ok(result[1][0] === 8);
    test.ok(result[1][1] === 2);
    test.ok(result[1][2] === 1);
    test.done();
};
/*

exports.testEvalExecState = function(test) {
    var state = require("../src/state.js");

    var accum = new state.State(function(st) {
        return [st,st+1];
    });

    // State Int Int
    test.ok(accum.evalState(10) === 10);
    test.ok(accum.execState(10) === 11);

    test.done();
};
*/
