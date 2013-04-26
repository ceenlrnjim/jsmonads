module.exports = (function() {

    var _makeResult = function(isRight, v) {
        return function(l,r) {
            var f = isRight ? r : l;
            return f.call(null, v);
        };
    };

    var _left = function(v) {
        return _makeResult(false, v);
    };

    var _right = function(v) {
        return _makeResult(true, v);
    };

    var _pure = function(v) {
        return _right(v);
    };

    var _bind = function(ma, f) {
        return ma.call(null, 
            function(e) {
                return _left(e);
            }, function(v) {
                try {
                    return f.call(null, v);
                } catch (e) {
                    return _left(e);
                }
            });
    };

    var _fail = function(str) {
        return _left(str);
    };

    var _sequence = function(ma, f) {
        ma.call(null, function(e) {
            return f.call(null);
        }, function(v) {
            return f.call(null);
        });
    };

    var _join = function(mma) {
        var f = function(v) { return v; };
        return mma.call(null, f,f);
    };

    return {pure: _pure, bind: _bind, fail: _fail, sequence: _sequence, join: _join, left:_left, right:_right}

})();
