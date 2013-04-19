module.exports = (function() {
    var defaults = require("./defaults.js");
    var _pure = function(v) {
        return new Right(v);
    };

    var _bind = function(ma, f) {
        return ma.match( function(v) {
            return new Left(v);
        }, function(v) {
            return f.call(null, v);
        });
    };

    var _fail = function(str) {
        return new Left(str);
    };

    var Left = function(v) {
        this.value = v;
    };

    Left.prototype.match = function(l,r) {
        return l.call(null, this.value);
    };

    Left.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    Left.prototype.left = function(f) {
        this.match(f,undefined);
        return this;
    };

    Left.prototype.right = function(f) {
        return this;
    };

    Left.prototype.sequence = function(f) {
        return defaults.sequence.call(null, this, f);
    };

    Left.prototype.fail = _fail;
    Left.prototype.pure = _pure;

    var Right = function(v) {
        this.value = v;
    };

    Right.prototype.match = function(l,r) {
        return r.call(null, this.value);
    };

    Right.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    Right.prototype.right = function(f) {
        this.match(undefined, f);
        return this;
    };

    Right.prototype.left = function(f) {
        return this;
    };

    Right.prototype.sequence = function(f) {
        return defaults.sequence.call(null, this, f);
    };

    Right.prototype.fail = _fail;
    Right.prototype.pure = _pure;

    return {Left:Left, Right:Right, pure:_pure, bind:_bind, fail: _fail, sequence: defaults.sequence};

})();
