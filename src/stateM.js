module.exports = (function() {
    var defaults = require("./defaults.js");
    // type StateM m s a = s -> m (a, s)
    var _withMonad(monad) {
        var _pure = function(v) {
            return function(s) {
                return monad.pure([v,s]); // TODO: can I leverage state monad here to prevent duplication?
            };
        };

        // TODO: don't understand this yet
        var _bind = function(stm, f) {
            return function(s) {
                return monad.bind(stm.call(null, s), function(vsp) {
                    var v = vsp[0];
                    var sprime = vsp[1];
                    return f.call(null, v).call(null, sprime); // TODO: need to understand how the typing works here
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

        return {pure: _pure,
                bind: _bind,
                mzero: _mzero,
                mplus: _mplus};
    };
    return {withMonad:_withMonad};
})();
