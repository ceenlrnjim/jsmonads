module.exports = (function() {
    var defaults = require("./defaults.js");
    var _pure = function(x) {
        return new State(function(st) {
            return [x, st];
        });
    };

    var _bind = function(ma, f) {
        // "The idea is that, given a state processor and a 
        // function that can generate another processor given the result of the first one, 
        // these two processors are combined to obtain a function that takes the initial state, 
        // and returns the second result and state (i.e. after the second function has processed them)."
        return new State(function(s) {
            var aNewState = ma.runState.call(null, s)
            var a = aNewState[0];
            var newState = aNewState[1];

            var stateG = f.call(null, a);
            return stateG.runState.call(null, newState);
        });
    };

    var _evalState = function(processor, st) {
        var result = processor.runState.call(null, st);
        return result[0];
    };

    var _execState = function(processor, st) {
        var result = processor.runState.call(null, st);
        return result[1];
    };

    var State = function(f) {
        this.runState = f;
    };

    State.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    State.prototype.fail = defaults.fail;
    State.prototype.sequence = function(f) {
        return defaults.sequence.call(null, this, f);
    };

    State.prototype.evalState = function(s) {
        return _evalState.call(null, this, s);
    };
    State.prototype.execState = function(s) {
        return _execState.call(null, this, s);
    };

    State.prototype.mapState = function(f) {
        var sma = this;
        return new State(function(sb) {
            var ares = sma.runState(sb);
            return [f.call(null, ares[0]), ares[1]];
        };
    };

    return {State:State, bind: _bind, pure: _pure, fail: defaults.fail, sequence: defaults.sequence};
})();
