module.exports = (function() {
    var _withMonad = function(monad) {
        var _pure = function(v) {
            return _lift(monad.pure(v));
            //return function(cb) {
                //setTimeout(function() {
                    //cb.call(null, monad.pure(v));
                //},0);
            //};
        };

        var _bind = function(ma, f) {
            return function(cb) {
                ma.call(null, function(res) {
                    monad.bind(res, function(v) {
                        f.call(null, v).call(null, cb);
                    });
                });
            };
        };

        var _mzero = function() {
            return _lift(monad.mzero());
            //return function(cb) {
                //setTimeout(function() {
                    //cb.call(null, monad.mzero());
                //},0);
            //};
        };

        var _mplus = function(ma,mb) {
            return function(cb) {
                ma.call(null, function(va) {
                    mb.call(null, function(vb) {
                        // TODO: setTimeout here?
                        cb.call(null, monad.mplus(va,vb));
                    })
                });
            };
        };

        return {pure:_pure, bind:_bind, mzero:_mzero, mplus:_mplus, lift:_lift};
    };

    var _lift = function(mv) {
        return function(cb) {
            setTimeout(function() {
                cb.call(null,mv);
            },0);
        };
    };

    return {withMonad:_withMonad, lift: _lift};
})();
