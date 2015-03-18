module.exports = (function() {
    // null is nothing, use monad to convert undefined
    var _pure = function(v) {
        if (v === undefined || v === null) {
            return null;
        } else {
            return v;
        }
    };

    var _bind = function(ma, f) {
        try {
            return ma === null ? ma : f(ma);
        } catch (e) {
            _fail(e);
        }
    };

    var _fail = function(str) {
        return null;
    };

    // >> :: Monad a -> (a -> Monad b) -> Monad b
    var _sequence = function(ma, f) {
        _bind(ma, function(unused) {
            return f();
        });
    };

    // ? same as pure?  no type nesting in this implementation
    //var _join = function(mma) {
        //return mma.match(function(j) { return j; }, function(n) { return n; });
    //};

    return {pure: _pure, bind: _bind, fail: _fail, sequence: _sequence, join: _pure}
})();
