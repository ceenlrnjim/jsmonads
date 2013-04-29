module.exports = (function() {
    // values in the promise monad are functions that take a function and call it when the value is ready
    var defaults = require('./defaults.js');
    var either = require('./either.js');

    var _pure = function(v) {
        return function(cb) {
            setTimeout(function() {
                cb.call(null, v);
            },0);
        };
    };

    var _bind = function(pa, f) {
        return function(cb) {
            pa.call(null, function(pa_v) {
                f.call(null, pa_v).call(null, cb);
            });
        };
    };

    var _sequence = function(ma, f) {
        return function(cb) {
            pa.call(null, function(unused) {
                f.call(null).call(null, cb);
            });
        };
    };

    return {pure:_pure, bind:_bind, fail:defaults.fail, sequence: _sequence};
})();
