// TODO: Need to remember to implement the other Monad Functions
// >> and fail, as well as functor stuff?
module.exports =(function() {
    // here wrapper objects are "types" and the actual js objects are the value constructors
    var maybe = require("./maybe.js");
    var promise = require("./promise.js");
    var either = require("./either.js");
    var writer = require("./writer.js");
    var list = require("./list.js");
    var state = require("./state.js");
    //
    // TODO: other monads?

    var _lift = function() {
        var argArray = Array.prototype.slice.call(arguments, 0);
        var monad = argArray[0];
        var fn = argArray[1];
        argArray.splice(0,2);
        return _liftInternal(fn, argArray, 0, [], monad);
    };

    var _liftInternal = function(f, ms, i, vs, monad) {
        if (ms.length === i) {
            return monad.pure(f.apply(null, vs));
        } else {
            return monad.bind(ms[i], function(v) {
                return _liftInternal(f, ms, i+1, vs.concat(v), monad);
            });
        }
    };

    var _domonad = function() {
        var argArray = Array.prototype.splice.call(arguments, 0, arguments.length);
        var monad = argArray.splice(0,1)[0];
        var init = argArray.splice(0,1)[0];
        var fns = argArray;

        var rv = init;
        for (var i=0,n=fns.length;i<n;i++) {
            rv = monad.bind(rv, fns[i]);
        }

        return rv;
    };


    //
    // TODO: what is the haskell version of this, or can't I have one since I can't pass the pure function for a typeclass?
    var _makeMonadic = function() {
        var argArray = Array.prototype.splice.call(arguments, 0, arguments.length);
        var monad = argArray.splice(0,1)[0];
        var f = argArray.splice(0,1)[0];
        var margs = argArray.map(function(v) { return monad.pure(v); });
        return _liftInternal(f, margs, 0, [], monad);
    };

    return { state:state, list:list, maybe: maybe, promise:promise, either:either, writer:writer, lift:_lift, makeMonadic: _makeMonadic, domonad:_domonad };
})();
