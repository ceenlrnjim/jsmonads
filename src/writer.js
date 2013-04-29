module.exports = (function() {
    var defaults = require("./defaults.js");

    var _withMonoid = function(monoid) {

        var _bind = function(ma, f) {
            var fres = f.call(null,ma[0]);
            return [fres[0], monoid.mappend(ma[1], fres[1])];
        };

        var _pure = function(v) {
            return [v, monoid.mempty()];
        };

        var _sequence = function(ma, f) {
            return f.call(null);
        };

        var _join = function(mma) {
            [[v,m], m];
            return [mma[0][0], monoid.mappend(mma[0][1], mma[1])];
        };

        var _tell = function(s) {
            return [[],s];
        };

        var _listen = function(ma) {
            var a = ma[0];
            var w = ma[1];
            return [[a,w],w];
        }

        return {bind:_bind, fail: defaults.fail, pure: _pure, sequence: _sequence, join: _join, tell: _tell, listen:_listen};
    };
    return {withMonoid: _withMonoid};

})();
