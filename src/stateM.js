module.exports = (function() {
    var defaults = require("./defaults.js");
    // type StateM m s a = s -> m (a, s)
    var _withMonad = function(monad) {
        var _pure = function(v) {
            return function(s) {
                return monad.pure([v,s]); // TODO: can I leverage state monad here to prevent duplication?
            };
        };

        var _bind = function(stm, f) {
            return function(s) {
                //execute the state function which returns a monad of the type provided
                //then bind to that monad with the provided function
                //using the value and state2 from the stateMonad,
                //construct another StateM be invoking f(value) and then invoke
                //that StateM function with sprime
                return monad.bind(stm.call(null, s), function(vsp) {
                    var v = vsp[0];
                    var sprime = vsp[1];
                    return f.call(null, v).call(null, sprime);
                });
            };
        };

        var _mzero = function() {
            return function(s) {
                return monad.mzero();
            };
        };

        var _mplus = function(stm1, stm2) {
            return function(s) {
                return monad.mplus(stm1.call(null, s), stm2.call(null, s));
            };
        };

        var _update = function(f) {
            return function(s) {
                return monad.pure([s, f.call(null,s)]);
            };
        };

        var _set = function(st) {
            return update(function(unused) { return st; });
        };

        var _fetch = function() {
            return update(function(st) { return st; });
        };


        return {pure: _pure,
                bind: _bind,
                mzero: _mzero,
                mplus: _mplus,
                update:_update,
                set:_set,
                fetch:_fetch};
    };
    return {withMonad:_withMonad};
})();
