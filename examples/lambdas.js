var monads = require("../src/jsmonads.js");
var pclib = require("../src/parcomb.js");
var pc = pclib.stringParser;
var pca = pclib.arrayParser;
var parser = monads.parser;

// 
// Objects to be parsed into
// 
var Expr = {};
var App = function(f,v) {
    console.log("Constructing App " + f + "," + v);
    this.fn = f;
    this.val = v;
};
App.prototype = {};

var mkApp = function(f,v) {
    return new App(f,v);
};

var Lam = function(name,body) {
    this.name=name;
    this.body=body;
};
Lam.prototype = {};

var Let = function(name, value, scope) {
};
Let.prototype = {};

var Var = function(name) {
    this.name = name;
    console.log("Constructing var named " +name);
};
Var.prototype = {};


//
// Parsing functions
//
var ident, identifier, symbol, variable, aVar,lam, local, atom, expr, paren, mklazyexpr, lazyexpr;
var lowStartString;
var manyWhite = pc.many(pc.whitespace());

lowStartString = pc.pdo([pc.lower, function() { return pc.many(pc.alphanum()); }],
    function(x, xs) {
        return x.concat(xs); // always a string
    });

ident = pc.token(manyWhite, pc.parse(manyWhite, lowStartString));

// with this definition, there must always be whitespace after an identifier
// so "let x = 7 in" but can't be "let x=7 in"
identifier = function(keywords) {
    return parser.bind(ident, function(i) {
        if (keywords.indexOf(i) === -1) {
            return parser.pure(i);
        } else {
            return parser.mzero();
        }
    });
};

symbol = function(s) {
    return pca.token(manyWhite, pca.parse(manyWhite, pca.stringP(s)));
};

variable = identifier(["let","in"]);

aVar = parser.bind(variable, function(x) {
    return parser.pure(new Var(x));
});

lam = pca.pdo([function() { return symbol("\\"); },
                   function() { return variable; },
                   function() { return symbol("->"); },
                   function() { return expr; }
                   ],
                   function(unused, x, unused, e) {
                       console.log("Constructing new lambda with " + x + " and " + e);
                       return new Lam(x,e);
                   });
local = pca.pdo([function() { return symbol("let"); },
                   function() { return variable; },
                   function() { return symbol("="); },
                   function() { return expr; },
                   function() { return symbol("in"); },
                   function() { return expr; }],
                   function(unused, x, unused, e1, unused, e2) {
                       return new Let(x, e1, e2);
                   });

paren = function(inp) {
    console.log("parsing paren: " + inp);
    return pca.between(symbol("("), expr, symbol(")"))(inp);
};

atom = function(inp) {
    console.log("Parsing atom: " +inp);
    return pca.or(lam, local, aVar, paren)(inp);
};

expr = function(inp) {
    console.log("Parsing expression: " + inp);
    return pca.chainl1(atom, parser.pure(mkApp))(inp);
};


mklazyexpr = function() {
    return lazyexpr;
};

lazyexpr = function(inp) {
    return expr()(inp);
};

//console.log(ident("aB12ac3 456"));
//console.log(ident("12abc"));
//console.log(variable("abc "));
//console.log(variable("let "));
//console.log(variable("letter ")); // TODO: what if the
//console.log(variable("let"));
//console.log(variable("x"));
//console.log(variable(" x"));
//console.log(variable("x "));
//console.log(variable(" x "));
//console.log(symbol("->")("--> "));
//console.log(symbol("->")("-> "));
//console.log(symbol("\\")("\\ x -> x "));
//console.log(pca.between(symbol("("), aVar, symbol(")"))("( a ) "));
//console.log(pc.between(symbol("("), pc.many(pc.letter()), symbol(")"))("(a)"));
//console.log(lam("\\x -> x"));
console.log(paren("(b c)"));
