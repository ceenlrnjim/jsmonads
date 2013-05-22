var rt = function() { return true; };
var rf = function() { return false; };
var checkFirstResult = function(test, parser, r, val, state) {

    var av,as,mt;
    var matches = parser.match(r, {
        emptyOk: function(x,rest) { mt="emptyOk"; av=x; as=rest; return x === val && rest === state; },
        emptyError: function() { mt="emptyError"; return false; },
        consumedOk: function(x,rest) { 
            mt="consumedOk"; 
            av=x; 
            as=rest; 
            return x === val && rest === state; },
        consumedError: function() { mt="consumedError"; return false; }});
        
    
    test.ok(matches, "value: [" + mt + "] expected " + val + "," + state + " got " + av + "," + as);
};

/*
exports.testItem = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;

    var r = pc.item()("a");
    checkFirstResult(test,r,"a","");

    r = pc.item()("abc");
    checkFirstResult(test,r,"a","bc");
    
    test.ok(pc.item()("").length === 0);
    test.done();
};
*/

exports.testSatisfies = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");
    var ns = function(input) { return parser.state(input, parser.position(1,1)); };

    var p = pc.satisfies(function(c) { return c === '1' || c === '2' || c === '3'; });
    var r = p.call(null, ns("111"))
    checkFirstResult(test, parser, r, "1", "11");
    
    r = p.call(null, ns("211"));
    checkFirstResult(test, parser,r,"2","11");

    r = p.call(null, ns("411"));
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testCharP = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");
    var ns = function(input) { return parser.state(input, parser.position(1,1)); };

    var r = pc.charP("J")(ns("Jim"));
    checkFirstResult(test, parser,r,"J","im");

    r = pc.charP("J")(ns("Bill"));
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testStringP = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");
    var ns = function(input) { return parser.state(input, parser.position(1,1)); };

    var r = pc.stringP("Jim")(ns("Jim Kirkwood"));
    checkFirstResult(test, parser,r,"Jim", " Kirkwood");

    r = pc.stringP("Jim")(ns("Jane Smith"));
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testChoice = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");
    var ns = function(input) { return parser.state(input, parser.position(1,1)); };

    var d = pc.digit();
    var u = pc.upper();
    var p = pc.choice(d,u);
    checkFirstResult(test, parser, p(ns("123")), "1", "23");
    checkFirstResult(test, parser, p(ns("ABC")), "A", "BC");
    test.ok(!parser.caseReply(p(ns("abc")), rt, rf));
    test.done();
};

exports.testOr = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = require("../src/parser.js");
    var ns = function(input) { return parser.state(input, parser.position(1,1)); };

    var d = pc.digit();
    var u = pc.upper();
    var l = pc.lower();
    //var p = pc.choice(pc.choice(d,u),l);
    var p = pc.or(d,u,l);
    checkFirstResult(test, parser, p(ns("123")), "1", "23");
    checkFirstResult(test, parser, p(ns("ABC")), "A", "BC");
    checkFirstResult(test, parser, p(ns("abc")), "a", "bc");
    test.ok(!parser.caseReply(p(ns("!abc")), rt, rf));
    test.done();
};

exports.testMany1 = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;
    var ns = function(input) { return parser.state(input, parser.position(1,1)); };
    
    var p = pc.many1(pc.lower());
    var r = p(ns("abc123"));
    checkFirstResult(test,parser, r,"abc","123");

    r = p(ns("123abc"));
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};


/*


exports.testMany = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.many(pc.digit());
    var r = p("123abc456");
    checkFirstResult(test, parser, r, "123", "abc456");

    r = p("1abc");
    checkFirstResult(test,parser, r,"1","abc");

    r = p("abc123");
    checkFirstResult(test,parser, r,"","abc123");

    test.done();
};

exports.testTry = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.choice(pc.pdo([pc.digit, pc.digit, pc.digit], function(a,b,c) { return a+b+c; }), 
                  pc.pdo([pc.digit, pc.digit, pc.lower], function(a,b,c) { return a+b+c; }));
    var r = p("123abc");
    checkFirstResult(test,parser,r,"123","abc");
    r = p("12abc");
    test.ok(!parser.caseReply(r, rt, rf));

    var p2 = pc.choice(pc.tryP(pc.pdo([pc.digit, pc.digit, pc.digit], function(a,b,c) { return a+b+c; })), 
                  pc.pdo([pc.digit, pc.digit, pc.lower], function(a,b,c) { return a+b+c; }));

    r = p2("123abc");
    checkFirstResult(test,parser,r,"123","abc");
    r = p2("12abc");
    checkFirstResult(test,parser,r,"12a","bc");

    return test.done();
};


exports.testSepBy1 = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.sepBy1(pc.digit(), pc.charP(","));
    var r = p("1,2,3,4");
    checkFirstResult(test,parser,r,"1234","");

    r = p("1,2a");
    checkFirstResult(test,parser,r,"12","a");

    r = p("Abcde");
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};
exports.testSepBy = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.sepBy(pc.digit(), pc.charP(","));
    var r = p("1,2,3,4");
    checkFirstResult(test,parser,r,"1234","");

    r = p("1,2abc");
    checkFirstResult(test,parser,r,"12","abc");

    r = p("Abcde");
    checkFirstResult(test,parser,r,"","Abcde");

    test.done();

};
exports.testBetween = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.between(pc.charP("("), pc.many(pc.lower()), pc.charP(")"));
    var r = p("(abcde)456");
    checkFirstResult(test,parser,r,"abcde","456");

    r = p("(abc45)");
    test.ok(!parser.caseReply(r, rt, rf));

    r = p("(abc");
    test.ok(!parser.caseReply(r, rt, rf));

    test.done();
};

exports.testChainl1 = function(test) {
    var monads = require("../src/jsmonads.js");
    var pcs = require("../src/parcomb.js").stringParser;
    var pca = require("../src/parcomb.js").arrayParser;
    var parser = monads.parser;

    var op = parser.bind(pca.charP("+"), function(plus) {
        return parser.pure(function(a,b) { return a + b; });
    });

    var num = parser.bind(pcs.many1(pcs.digit()), function(n) {
        return parser.pure(eval(n));
    });

    var p = pca.chainl1(num, op);
    var r = p("1+2+3");
    checkFirstResult(test,parser,r,6,"");

    test.done();
};
exports.testWhitespace = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    checkFirstResult(test,parser, pc.whitespace()(" \t  \nabc"), "", "abc");

    test.done();
};

exports.testParse = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.parse(pc.whitespace(), pc.many1(pc.digit()));
    checkFirstResult(test,parser, p("  123Jim"), "123", "Jim");

    test.done();
};

exports.testToken = function(test) {
    var monads = require("../src/jsmonads.js");
    var pc = require("../src/parcomb.js").stringParser;
    var parser = monads.parser;

    var p = pc.token(pc.whitespace(), pc.many1(pc.letter()));
    checkFirstResult(test,parser, p("Jim\n"), "Jim", "");

    test.done();

};
*/
