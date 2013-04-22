module.exports = (function() {
    var defaults = require("./defaults.js");

    var _bind = function(ma, f) {
        var result = ma.match(f);
        return new Writer(result.value, ma.monoid.mappend(result.monoid));
    };

    var _pure = function(v) {
        // TODO: how will pure work here without a Monoid type specified for w?
    };

    var Writer = function(v, w) {
        this.value = v;
        this.monoid = w;
    };

    Writer.prototype.pure = function(v) {
        return new Writer(v, this.monoid.mempty());
    };

    Writer.prototype.match = function(f) {
        return f.call(null, this.value, this.monoid);
    };

    Writer.prototype.withValue = function(f) {
        f.call(null, this.value);
        return this;
    };

    Writer.prototype.withMonoid = function(f) {
        f.call(null, this.monoid);
        return this;
    };

    Writer.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    Writer.prototype.sequence = function(f) {
        return defaults.sequence.call(null, this, f);
    };
    return {Writer:Writer, bind:_bind, fail: defaults.fail, sequence: defaults.sequence};

})();
