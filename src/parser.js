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
        if (!state.type || state.type !== stateTypeId) {
            throw new TypeError("cannont construct ok with non-state");
        };
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

    var _isState = function(s) {
        return (s.type && s.type === stateTypeId);
    };

    var _position = function(line,col) {
        return {line:line,col:col};
    };

    var _caseReply = function(reply, onOk, onError) {
        return reply.type === okTypeId ?  onOk(reply.result, reply.state.input, reply) : onError(null, reply);
    };

    // handles laziness of the consumed/empty constructors
    var _caseConsumed = function(consumedOrEmpty, onEmpty, onConsumed) {
        return consumedOrEmpty.type === emptyTypeId ? onEmpty(consumedOrEmpty.replyFn()) : onConsumed(consumedOrEmpty.replyFn());
    };

    var _match = function(r, fns) {
        return _caseConsumed(r,
            function onEmpty(reply) {
                return _caseReply(reply,
                    function onOk(x,rest,s) {
                        return fns.emptyOk ? fns.emptyOk(x,rest,s) : fns.otherwise( r); // need to validate we always want r and never reply here
                    },
                    function onError() {
                        return fns.emptyError ? fns.emptyError( reply.msg) : fns.otherwise( r);
                    });
            },
            function onConsumed(reply) {
                return _caseReply(reply,
                    function onOk(x,rest,s) {
                        return fns.consumedOk ? fns.consumedOk(x,rest,s) : fns.otherwise( r);
                    },
                    function onError() {
                        return fns.consumedError ? fns.consumedError( reply.msg) : fns.otherwise( r);
                    });
            });
    };

    var _pure = function(v) { 
        return function(s) {
            return _empty(_ok(v, s, _message(s.pos, "", [])));
        };
    };


    // "Due to laziness...This 'early' returning is essential for the efficient behavior of the choice combinator"
    var _bind = function(ma, f) {
        return function(s) {
            return _match(ma(s), {
                emptyOk: function(x,rest,reply) { 
                    return f( x)( reply.state); 
                },
                emptyError: function(errmsg) { 
                    return _empty(_error(errmsg));
                },
                // lazy here is a bit different than original
                consumedOk: function(x,rest,reply) {
                    return _lzConsumed(
                        function() {
                            var identity = function(v) { return v; };
                            return _caseConsumed(f(x)(reply.state), identity, identity);
                        });
                },
                consumedError: function(reply) {
                    return _consumed(reply);
                }});
        };
    };

    var _sequence = function(ma, f) {
        return _bind(ma, function(unused) {
            return f();
        });
    };

    var _mzero = function() { 
        return function(s) { 
            return empty(error(message(s.pos, "", [])));
        }; 
    };

    // " Notice that the positions of the error message passed to merge should always be the
    //same. Since the choice combinator only calls merge when both alternatives have
    //not consumed input, both positions are guaranteed to be equal."
    var _mergeOk = function(v, input, msg1, msg2) {
        return _empty(_ok(v, _state(input, msg2.pos), _merge(msg1, msg2)));
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
            var r = p( s);
            return _match(r, {
                // if p failed, try q
                emptyError: function(msg) { 
                    return _match(q( s), {
                        emptyError: function(msg2) {
                            return _mergeError(msg, msg2);
                        },
                        emptyOk: function(x, rest,reply) {
                            return _mergeOk(x, rest, msg, reply.msg);
                        },
                        otherwise: function(reply) { // consumed
                            return reply;
                        }});
                },
                // if p succeeds without consuming input, q is favored if it does consume input (longest match rule)
                emptyOk: function(reply) { 
                    return _caseConsumed(q( s),
                        function onEmpty() { return empty(reply); },
                        function onConsumed(r2) { return r2; });
                    },
                // if p consumes data it is chosen
                consumedError: function() { return r; },
                consumedOk: function() { return r; }
            });
        };
    };

    var _run = function(p,input) {
        var initial_state = _state(input, _position(1,1));
        var okout = function(v, rest) {
            console.log("Parser returned: " + v);
            console.log(" - remaining input: " + rest);
            return v;
        };
        var errout = function(errmsg) {
            console.log("Parse error at (line "+ errmsg.pos.line + ", column " + errmsg.pos.col + ")");
            console.log("unexpected '" + errmsg.unexpected + "'");
            console.log("expecting " + errmsg.expecteds);
            return errmsg;
        };

        return _match(p( initial_state), {
            emptyError: errout,
            emptyOk: okout,
            consumedError: errout,
            consumedOk: okout});
    };

    return { pure: _pure, bind: _bind, mplus:_mplus, mzero: _mzero, empty:_empty, ok:_ok, error:_error, consumed: _consumed, caseReply: _caseReply, caseConsumed: _caseConsumed, lzConsumed: _lzConsumed, lzEmpty: _lzEmpty, match:_match, sequence:_sequence, state:_state, message:_message, position:_position, isState: _isState, run:_run };
})();
