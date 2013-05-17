module.exports = (function() {
    var defaults = require("./defaults.js");

    var _pure = function(x) {
        return function(st) {
            return [x, st];
        };
    };

    var _bind = function(ma, f) {
        // "The idea is that, given a state processor and a 
        // function that can generate another processor given the result of the first one, 
        // these two processors are combined to obtain a function that takes the initial state, 
        // and returns the second result and state (i.e. after the second function has processed them)."
        return function(s) {
            var aNewState = ma.call(null, s)
            var a = aNewState[0];
            var newState = aNewState[1];

            var stateG = f.call(null, a); // chain the values from the state into the monadic function
            return stateG.call(null, newState); // chain prior state and the f-state to get the cumulative state of the two
        };
    };

    // TODO: join

    var _evalState = function(processor, st) {
        var result = processor.call(null, st);
        return result[0];
    };

    var _execState = function(processor, st) {
        var result = processor.call(null, st);
        return result[1];
    };

    var _mapState = function(sma, f) {
        return function(sb) {
            var ares = sma(sb);
            return [f.call(null, ares[0]), ares[1]];
        };
    };

    // update :: (s -> s) -> State s s
    var _update = function(f) {
        return function(st) {
            return [st, f.call(null, st)];
        };
    };

    var _set = function(st) {
        return update(function(unused) { return st; });
    };

    var _fetch = function() {
        return update(function(st) { return st; });
    };

    return {bind: _bind, 
            pure: _pure, 
            fail: defaults.fail, 
            sequence: defaults.sequence, 
            mapState:_mapState, 
            set:_set,
            fetch: _fetch,
            update:_update};
})();
