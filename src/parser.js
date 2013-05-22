module.exports = (function() {
    // type Parser a = State -> Consumed a
    // data Consumed a = Consumed (Reply a) -- consumed input
    //                  | Empty (Reply a) -- returned value without consuming input
    // data Reply a = Ok a State Message -- single result and rest input
    //                | Error Message -- parse error
    // data State = State String Pos
    // data Message = Message Pos String [String]

    var emptyTypeId = {name:"Empty"};
    var consumedTypeId = {name:"Consumed"};
    var errorTypeId = {name:"Error"};
    var okTypeId = {name:"Ok"};
    var stateTypeId = {name:"State"};
    var msgTypeId = {name:"Message"};

    // the reply is wrapped in a no-arg function to make its evaluation lazy
    var _lzEmpty = function(replyFn) {
        return {type: emptyTypeId, replyFn:replyFn};
    };

    // the reply is wrapped in a no-arg function to make its evaluation lazy
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

    var _ok = function(v, state, msg) {
        return { type: okTypeId, result: v, state: state, msg: msg };
    };

    var _error = function(msg) {
        return {type: errorTypeId, msg:msg};
    };

    var _message = function(pos, unexpected, expecteds) {
        return {type: msgTypeId, unexpected: unexpected, expecteds:expecteds, pos: pos};
    };

    var _state = function(input, pos) {
        return {type: stateTypeId, input:input, pos:pos};
    };

    var _position = function(line,col) {
        return {line:line,col:col};
    };

    var _caseReply = function(reply, onOk, onError) {
        return reply.type === okTypeId ?  onOk.call(null, reply.result, reply.state.input, reply) : onError(null, reply);
    };

    // handles laziness of the consumed/empty constructors
    var _caseConsumed = function(c, onEmpty, onConsumed) {
        return c.type === emptyTypeId ? onEmpty.call(null, c.replyFn.call(null)) : onConsumed.call(null, c.replyFn.call(null));
    };

    var _match = function(r, fns) {
        return _caseConsumed(r,
            function onEmpty(reply) {
                return _caseReply(reply,
                    function onOk(x,rest,s) {
                        return fns.emptyOk ? fns.emptyOk.call(null,x,rest,s) : fns.otherwise.call(null, r); // need to validate we always want r and never reply here
                    },
                    function onError() {
                        return fns.emptyError ? fns.emptyError.call(null, reply.msg) : fns.otherwise.call(null, r);
                    });
            },
            function onConsumed(reply) {
                return _caseReply(reply,
                    function onOk(x,rest,s) {
                        return fns.consumedOk ? fns.consumedOk.call(null,x,rest,s) : fns.otherwise.call(null, r);
                    },
                    function onError() {
                        return fns.consumedError ? fns.consumedError.call(null, reply.msg) : fns.otherwise.call(null, r);
                    });
            });
    };

    var _pure = function(v) { 
        // inp is now State
        return function(s) {
            return _empty(_ok(v, s, _message(s.pos, "", [])));
        };
    };


    // "Due to laziness...This 'early' returning is essential for the efficient behavior of the choice combinator"
    var _bind = function(ma, f) {
        return function(s) {
            return _match(ma.call(null,s), {
                emptyOk: function(x,rest,reply) { 
                    return f.call(null, x).call(null, reply.state); 
                },
                emptyError: function(reply) { 
                    return _empty(_error(message(s.pos,"",[]))); 
                },
                // TODO: lazy here is a bit different than original
                consumedOk: function(x,rest,reply) {
                    return _lzConsumed(
                        function() {
                            var identity = function(v) { return v; };
                            return _caseConsumed(f.call(null,x).call(null,reply.state), identity, identity);
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
        return function(s) { 
            return empty(error(message(s.pos, "", [])));
        }; 
    };

    var _mergeOk = function(v, input, msg1, msg2) {
        return _empty(_ok(v, input, _merge(inp1, inp2)));
    };

    var _mergeError = function(msg1,msg2) {
        return _empty(_error(_merge(msg1,msg2)));
    };

    var _merge = function(msg1,msg2) {
        return _message(msg1.pos, msg1.unexpected, msg1.expecteds.concat(msg2.expecteds));
    };

    // for this parser, mplus is the choice operator
    var _mplus = function(p, q) { 
        return function(s) {
            var r = p.call(null, s);
            return _match(r, {
                // if p failed, try q
                emptyError: function(msg) { 
                    return _match(q.call(null, s), {
                        emptyError: function(msg2) {
                            return _mergeError(msg, msg2);
                        },
                        emptyOk: function(x, rest,reply) {
                            _mergeOk(x, rest, msg, reply.msg);
                        },
                        otherwise: function(reply) { // consumed
                            return reply;
                        }});
                },
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

    return { pure: _pure, bind: _bind, mplus:_mplus, mzero: _mzero, empty:_empty, ok:_ok, error:_error, consumed: _consumed, caseReply: _caseReply, caseConsumed: _caseConsumed, lzConsumed: _lzConsumed, lzEmpty: _lzEmpty, match:_match, sequence:_sequence, state:_state, message:_message, position:_position };
})();


