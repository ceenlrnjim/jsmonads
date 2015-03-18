module.exports = (function() {
    // values in the promise monad are functions that take a function and call it when the value is ready
    var defaults = require('./defaults.js');
    var either = require('./either.js');

    var _pure = function(v) {
        return function(cb) {
            setTimeout(function() {
                cb(v);
            },0);
        };
    };

    var _bind = function(pa, f) {
        return function(cb) {
            pa(function(pa_v) {
                f(pa_v)(cb);
            });
        };
    };

    var _sequence = function(ma, f) {
        return function(cb) {
            pa(function(unused) {
                f()(cb);
            });
        };
    };

    // f must take two arguments, success and failure callbacks that take [0..1] arguments
    var _fromCallbacks = function(f) {
        return function(cb) {
            var s = function(v) {
                cb(either.right(v));
            };
            var f = function(r) {
                cb(either.left(r));
            };

            f(s, f);
        };
    };

    return {pure:_pure, bind:_bind, fail:defaults.fail, sequence: _sequence};
})();
