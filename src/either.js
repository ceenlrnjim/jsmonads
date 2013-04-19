module.exports = (function() {
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


    var Left = function(v) {
        this.value = v;
    };

    Left.prototype.match = function(l,r) {
        return l.call(null, this.value);
    };

    Left.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    Left.prototype.pure = _pure;

    Left.prototype.left = function(f) {
        this.match(f,undefined);
        return this;
    };

    Left.prototype.right = function(f) {
        return this;
    };

    var Right = function(v) {
        this.value = v;
    };

    Right.prototype.match = function(l,r) {
        return r.call(null, this.value);
    };

    Right.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    Right.prototype.pure = _pure;

    Right.prototype.right = function(f) {
        this.match(undefined, f);
        return this;
    };

    Right.prototype.left = function(f) {
        return this;
    };

    return {Left:Left, Right:Right, pure:_pure, bind:_bind};

})();
