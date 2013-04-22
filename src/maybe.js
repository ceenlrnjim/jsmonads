module.exports = (function() {
    var defaults = require("./defaults.js");
    var _pure = function(v) {
        if (v === undefined || v === null) {
            return new Nothing();
        } else {
            return new Just(v);
        }
    };
    var _bind = function(ma, f) {
        return ma.match(function(v) { return f.call(null,v); }, function() { return ma; });
    };

    var _fail = function(str) {
        return new Nothing();
    };

    var _join = function(mma) {
        return mma.match(function(j) { return j; }, function(n) { return n; });
    };

    var Just = function(value) {
        this.value = value;
    };

    // Putting pure on the object so code that just has an instance of a monad can access it
    Just.prototype.pure = _pure;
    Just.prototype.fail = _fail;
    Just.prototype.sequence = function(f) {
        return defaults.sequence.call(null,this, f);
    };
    Just.prototype.match = function(j,n) {
        return j(this.value);
    };
    Just.prototype.bind = function(f) {
        return _bind(this, f);
    };
    Just.prototype.just = function(f) {
        this.match(f, undefined);
        return this;
    };
    Just.prototype.nothing = function(f) {
        return this;
    };

    var Nothing = function() {
    };
    Nothing.prototype.match = function(j,n) {
        if (n === undefined || typeof n !== 'function') {
            return this;
        } else {
            return n.call(null);
        }
    };
    Nothing.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };
    Nothing.prototype.just = function(f) {
        return this;
    };
    Nothing.prototype.nothing = function(f) {
        this.match(undefined,f);
        return this;
    };
    Nothing.prototype.pure = _pure;
    Nothing.prototype.fail = _fail;
    Nothing.prototype.sequence = function(f) {
        return defaults.sequence.call(null,this, f);
    };



    return {Just:Just, Nothing:Nothing, pure:_pure, bind:_bind, fail:_fail, sequence:defaults.sequence, join: _join};
})();