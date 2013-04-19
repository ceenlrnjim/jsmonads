// TODO: Need to remember to implement the other Monad Functions
// >> and fail, as well as functor stuff?
module.exports =(function() {
    var maybe = require("./maybe.js");
    // here wrapper objects are "types" and the actual js objects are the value constructors
    var promise = require("./promise.js");
    var either = require("./either.js");

    // writer depends on 'log' being a monoid so you have mempty and mappend
    var writer = require("./writer.js");
    var list = require("./list.js");
    // TODO: other monads?

    var _lift = function() {
        var argArray = Array.prototype.splice.call(arguments, 0, arguments.length);
        var fn = argArray[0];
        argArray.splice(0,1);
        return _liftInternal(fn, argArray, 0, [], argArray[0].pure);
    };

    var _liftInternal = function(f, ms, i, vs, pure) {
        if (ms.length === i) {
            return pure(f.apply(null, vs));
        } else {
            return ms[i].bind(function(v) {
                return _liftInternal(f, ms, i+1, vs.concat(v), pure);
            });
        }
    };
    //
    // TODO: what is the haskell version of this, or can't I have one since I can't pass the pure function for a typeclass?
    var _makeMonadic = function() {
        var argArray = Array.prototype.splice.call(arguments, 0, arguments.length);
        var pure = argArray.splice(0,1)[0].pure;
        var f = argArray.splice(0,1)[0];
        var margs = argArray.map(function(v) { return pure(v); });
        return _liftInternal(f, margs, 0, [], pure);
    };

    return { list:list, maybe: maybe, promise:promise, either:either, writer:writer, lift:_lift, makeMonadic: _makeMonadic };
})();
