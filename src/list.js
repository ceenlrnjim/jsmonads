module.exports = (function() {

    var _pure = function(v) {
        return [v];
    };

    var _mempty = function() {
        return [];
    };

    var _mappend = function(anArray, otherArray) {
        return anArray.concat(otherArray);
    };

    var _mconcat = function(arrayOfArrays) {
        //return arrayOfArrays.reduce(function(r,n) { return _mappend(r,n); });
        if (arrayOfArrays.length === 0) {
            return arrayOfArrays;
        } else {
            return arrayOfArrays.reduce(_mappend);
        }
    };

    var _bind = function(ma, f) {
        return _mconcat(ma.map(f));
    };

    var _join = _mconcat;

    var _sequence = function(ma, f) {
        var mapResult = new Array(ma.length);
        for (var i=0, n=ma.length;i<n;i++) {
            mapResult[i] = f(); // stripping out the argument
        }
        return _mconcat(mapResult);
    };

    var _mplus = _mappend
    var _mzero = function() { return []; };

    return {pure:_pure, bind:_bind, join: _join, sequence: _sequence, mempty: _mempty, mappend:_mappend, mconcat: _mconcat, mplus: _mplus, mzero: _mzero};

})();
