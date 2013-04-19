module.exports =(function() {
    // >> function (what do people call this thing)?
    var _sequence = function(ma, f) {
        return ma.bind(function(unused) {
            return f.call(null);
        });
    };

    var _fail = function(str) {
        throw str;
    };

    return { sequence: _sequence, fail: _fail};
})();
