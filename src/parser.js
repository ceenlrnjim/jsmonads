module.exports = (function() {
    // a parser is a function that takes input and returns [val, unconsumed]
    // a
    var _pure = function(v) { 
        return function(inp) { 
            return [ [v,inp] ]; 
        };
    };

    var _bind = function(ma, f) {
        return function(inp) {
            var pairlist = ma.call(null, inp);
            var result = [];

            // each result from ma() (a list of values and remaining text),
            // since f is monadic, it must return a parser.  So calling
            // f(value) returns a parser that is then applied to the remaining text
            // All results are concatenated together and returned
            pairlist.forEach(function(p) {
                var v = p[0];
                var out = p[1];
                var theparser = (f.call(null, v));
                var parseresult = theparser.call(null,out);
                // concatenate the returned lists to get back to [ [v,out] ]
                result = result.concat(parseresult);
            });

            return result;
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

    return { pure: _pure, bind: _bind, mplus:_mplus, mzero: _mzero };
})();


