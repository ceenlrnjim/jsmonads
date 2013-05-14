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
            // the ma parser returns a list of v/output pairs
            // iterate over each one, passing the v to f to generate a parser
            // then pass output (the remaining unprocessed text) to that parser
            pairlist.forEach(function(p) {
                var v = p[0];
                var out = p[1];
                var theparser = (f.call(null, v));
                // concatenate the returned lists to get back to [ [v,out] ]
                result = result.concat(theparser.call(null, out));
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
            return p.call(null,inp).concat(q.call(inp));
        };
    };

    return { pure: _pure, bind: _bind, mplus:_mplus, mzero: _mzero };
})();


