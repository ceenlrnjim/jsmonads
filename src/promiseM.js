// so a typical JS promise would be a promiseM.withMonad(either);
module.exports = (function() {
    var _withMonad = function(monad) {
        var _pure = function(v) {
            return _lift(monad.pure(v));
        };

        var _bind = function(ma, f) {
            return function(cb) {
                ma(function(res) {
                    monad.bind(res, function(v) {
                        f(v)(cb);
                    });
                });
            };
        };

        var _mzero = function() {
            return _lift(monad.mzero());
        };

        var _mplus = function(ma,mb) {
            return function(cb) {
                ma(function(va) {
                    mb(function(vb) {
                        // TODO: setTimeout here?
                        cb(monad.mplus(va,vb));
                    })
                });
            };
        };

        return {pure:_pure, bind:_bind, mzero:_mzero, mplus:_mplus, lift:_lift};
    };

    var _lift = function(mv) {
        return function(cb) {
            setTimeout(function() {
                cb(mv);
            },0);
        };
    };

    return {withMonad:_withMonad, lift: _lift};
})();
