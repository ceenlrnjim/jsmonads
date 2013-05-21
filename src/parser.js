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

    // TODO: add undefined checks
    var _match = function(r, fns) {
        return _caseConsumed(r,
            function onEmpty(reply) {
                return _caseReply(reply,
                    function onOk(x,rest) {
                        return fns.emptyOk.call(null,x,rest);
                    },
                    function onError() {
                        return fns.emptyError.call(null, reply);
                    });
            },
            function onConsumed(reply) {
                return _caseReply(reply,
                    function onOk(x,rest) {
                        return fns.consumedOk.call(null, x, rest);
                    },
                    function onError() {
                        return fns.consumedError.call(null, reply);
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
                            


            /*
            return _caseConsumed(ma.call(null, inp),
                        function empty(reply) {
                            return _caseReply(reply,
                                // Empty Ok
                                function ok(x,rest) {
                                    //console.log("Empty OK " + x + " " + rest);
                                    return f.call(null, x).call(null, rest);
                                },
                                // Empty Error
                                function error() {
                                    //console.log("Empty Error");
                                    return _empty(error());
                                });
                        },
                        function consumed(reply) {
                            return _lzConsumed(
                                // need Lazy evaluation
                                function() {
                                    return _caseReply(reply,
                                    // Consumed Ok
                                    function ok(x, rest) {
                                        return _caseConsumed(f.call(null, x).call(null, rest),
                                            function subempty(reply2) {
                                                //console.log("Consumed OK " + x + " " + rest);
                                                return reply2;
                                            },
                                            function subconsumed(reply2) {
                                                //console.log("Consumed Error");
                                                return reply2;
                                            });
                                    },
                                    // Consumed Error
                                    function error() {
                                        return reply;                       
                                    })
                                });
                        });
                        */
        };
    };

    var _mzero = function() { 
        return function(inp) { 
            return []; 
        }; 
    };

    var _mplus = function(p, q) { 
        return function(inp) {
            return p.call(null,inp).concat(q.call(null,inp));
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

    return { pure: _pure, bind: _bind, mplus:_mplus, mzero: _mzero, empty:_empty, ok:_ok, error:_error, consumed: _consumed, caseReply: _caseReply, caseConsumed: _caseConsumed, lzConsumed: _lzConsumed, lzEmpty: _lzEmpty, match:_match };
})();


