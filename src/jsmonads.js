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
    var stateM = require("./stateM.js");
    var reader = require("./reader.js");
    var objmon = require("./objectMonoid.js");
    var parser = require("./parser.js");
    //
    // TODO: other monads?

    // lift :: (a -> b -> c) -> m a -> m b -> mc
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

    /**
     * Pass the result of bind on each monad as the value to bind of the next monad
     * takes a monad object, an initial monad value, and any number of monadic function arguments
     */
    var _thread = function() {
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

    /**
     * As close to haskell's do as I can think of
     * mdo(maybe, [ma, mb, mc], function(a,b,c) {...});
     *
     */
    var _mdo = function(monad, ms, f) {
        var _mdoInternal = function(vals,i) {
            if (i === ms.length) {
                return f.apply(null, vals);
            } else {
                return monad.bind(ms[i], function(v) {
                    return _mdoInternal(vals.concat([v]), i+1);
                });
            }
        };
        return _mdoInternal([], 0);
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

    return { parser: parser, 
             objmon: objmon, 
             reader:reader, 
             state:state, 
             stateM:stateM,
             list:list, 
             maybe: maybe, 
             promise:promise, 
             either:either, 
             writer:writer, 
             lift:_lift, 
             makeMonadic: _makeMonadic, 
             thread:_thread, 
             mdo:_mdo };
})();
