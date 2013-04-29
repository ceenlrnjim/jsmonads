module.exports = (function() {
    var defaults = require("./defaults.js");
    //Some programming problems require computations within a shared environment (such as a set of variable bindings). 
    //These computations typically read values from the environment and sometimes execute sub-computations 
    //in a modified environment (with new or shadowing bindings, for example), 
    //but they do not require the full generality of the State monad.
    //
    // Values in the Reader monad are functions from an environment to a value. 
    // To extract the final value from a computation in the Reader monad, 
    // you simply apply (runReader reader) to an environment value.

    var _pure = function(v) {
        return function(env) {
            return v;
        };
    };

    // f :: v -> 
    var _bind = function(ma, f) {
        return function(env) {
            // f(ma(env))(env)
            return f.call(null, ma.call(null, env)).call(null, env);
        };
    };

    var _ask = function() {
        return function(env) {
            return env;
        };
    };

    var _local = function(envfn, ma) {
        return function(env) {
            ma.call(null, envfn.call(null, env));
        };
    };

    var _join = function(mma) {
        return function(env) {
            // TODO: is this correct behavior?
            return mma.call(null, env).call(null, env);
        };
    };

    var _sequence = function(ma, f) {
        return function(env) {
            f.call(null).call(null, env);
        };
    };

    return {bind:_bind, fail: defaults.fail, pure: _pure, sequence: _sequence, join: _join, ask: _ask, local:_local};
})();
