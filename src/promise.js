module.exports = (function() {
    var Promise = function() {
        this.resolved = false;
    };
    var _invokeCallbacks = function(p) {
        // using one callback for now
        if (p.callback) {
            setTimeout(function() { 
                p.callback.call(null, p.value);
            }, 0);
        }
    };
    Promise.prototype.resolve = function(v) {
        if (!this.resolved) {
            this.resolved = true;
            this.value = v;
            _invokeCallbacks(this);
        }
    };
    Promise.prototype.then = function(f) {
        this.callback = f;
        if (this.resolved) {
            _invokeCallbacks(this);
        }
    };
    Promise.prototype.match = Promise.prototype.then;

    var _pure = function(v) {
        var promise = new Promise();
        promise.resolve(v);
        return promise;
        };

    var _bind = function(ma, f) {
        // this f must return another promise, though match is not required to do so
        // can't just return fpromise because it doesn't exist yet
        var promise = new Promise();
        ma.then(function(v) {
            var fpromise = f.call(null, v);
            fpromise.then(function(v2) {
                promise.resolve(v2);
            });
        });
        return promise;
    };
    
    Promise.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    Promise.prototype.pure = function(v) {
        return _pure.call(null, v);
    };

    return {Promise:Promise, pure:_pure, bind:_bind};
})();
