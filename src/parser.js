module.exports = (function() {
    // type Parser a = String -> Consumed a
    // data Consumed a = Consumed (Reply a) -- consumed input
    //                  | Empty (Reply a) -- returned value without consuming input
    // data Reply a = Ok a String -- single result and rest input
    //                | Error -- parse error

    var emptyTypeId = {name:"Empty"};
    var consumedTypeId = {name:"Consumed"};
    var errorTypeId = {name:"Error"};
    var okTypeId = {name:"Ok"};

    var _lzEmpty = function(replyFn) {
        return {type: emptyTypeId, replyFn:replyFn};
    };

    var _lzConsumed = function(replyFn) {
        return {type: consumedTypeId, replyFn:replyFn};
    };

    // Eager version where laziness isn't required
    var _empty = function(reply) {
        return _lzEmpty(function() { return reply; });
    };

    // Eager version where laziness isn't required
    var _consumed = function(reply) {
        return _lzConsumed(function() { return reply; });
    };

    var _ok = function(v, rest) {
        return { type: okTypeId, result: v, rest: rest };
    };

    var _error = function() {
        return {type: errorTypeId};
    };

    var _caseReply = function(reply, onOk, onError) {
        return reply.type === okTypeId ?  onOk.call(null, reply.result, reply.rest) : onError(null, reply);
    };

    // handles laziness of the consumed/empty constructors
    var _caseConsumed = function(c, onEmpty, onConsumed) {
        return c.type === emptyTypeId ? onEmpty.call(null, c.replyFn.call(null)) : onConsumed.call(null, c.replyFn.call(null));
    };

    var _match = function(r, fns) {
        return _caseConsumed(r,
            function onEmpty(reply) {
                return _caseReply(reply,
                    function onOk(x,rest) {
                        return fns.emptyOk ? fns.emptyOk.call(null,x,rest) : fns.otherwise.call(null, r); // need to validate we always want r and never reply here
                    },
                    function onError() {
                        return fns.emptyError ? fns.emptyError.call(null, reply) : fns.otherwise.call(null, r);
                    });
            },
            function onConsumed(reply) {
                return _caseReply(reply,
                    function onOk(x,rest) {
                        return fns.consumedOk ? fns.consumedOk.call(null,x,rest) : fns.otherwise.call(null, r);
                    },
                    function onError() {
                        return fns.consumedError ? fns.consumedError.call(null, reply) : fns.otherwise.call(null, r);
                    });
            });
    };

    var _pure = function(v) { 
        return function(inp) {
            return _empty(_ok(v, inp));
        };
    };


    // TODO: There are going to be problems here without laziness - may need to manually add it back
    // lots of "Due to laziness...This 'early' returning is essential for the efficient behavior of the choice
    // combinator"
    var _bind = function(ma, f) {
        return function(inp) {
            return _match(ma.call(null,inp), {
                emptyOk: function(x,rest) { 
                    return f.call(null, x).call(null, rest); 
                },
                emptyError: function(reply) { 
                    return _empty(_error()); 
                },
                // TODO: lazy here is a bit different than original
                consumedOk: function(x,rest) {
                    return _lzConsumed(
                        function() {
                            var identity = function(v) { return v; };
                            return _caseConsumed(f.call(null,x).call(null,rest), identity, identity);
                        });
                },
                consumedError: function(reply) {
                    return _consumed(reply);
                }});
        };
    };

    var _sequence = function(ma, f) {
        return _bind(ma, function(unused) {
            return f.call(null);
        });
    };

    var _mzero = function() { 
        return function(inp) { 
            return empty(error());
        }; 
    };

    // for this parser, mplus is the choice operator
    var _mplus = function(p, q) { 
        return function(inp) {
            var r = p.call(null, inp);
            return _match(r, {
                // if p failed, try q
                emptyError: function() { return q.call(null, inp); },
                // if p succeeds without consuming input, q is favored if it does consume input (longest match rule)
                emptyOk: function(reply) { 
                    return _caseConsumed(q.call(null, inp),
                        function onEmpty() { return empty(reply); },
                        function onConsumed(r2) { return r2; });
                    },
                // if p consumes data it is chosen
                consumedError: function() { return r; },
                consumedOk: function() { return r; }
            });
        };
    };

    var _toString = function(res) {
        if (res.length === 0) return "[]";
        
        var s = "[";
        res.forEach(function(p) {
            if (p.length === 0) s = s + "[],";
            else s = s + "[" + p[0] +","+p[1] + "]";
        });
        s = s + "]";

        return s;
    };

    return { pure: _pure, bind: _bind, mplus:_mplus, mzero: _mzero, empty:_empty, ok:_ok, error:_error, consumed: _consumed, caseReply: _caseReply, caseConsumed: _caseConsumed, lzConsumed: _lzConsumed, lzEmpty: _lzEmpty, match:_match, sequence:_sequence };
})();


