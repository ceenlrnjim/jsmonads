module.exports = (function() {
    var _listConcat = function(arrayOfLists) {
        return arrayOfLists.reduce(function(r,n) { return r.mappend(n); });
    };

    var _bind = function(ma, f) {
        return _listConcat(ma.contents.map(f));
    };

    var _pure = function(v) {
        return new List([v]);
    };

    var List = function(vals) {
        this.contents = vals || [];
    };

    List.prototype.mempty = function() {
        return new List();
    };

    List.prototype.mappend = function(otherList) {
        return new List(this.contents.concat(otherList.contents));
    };

    List.prototype.mconcat = function(arrayOfLists) {
        return _listConcat.call(null, [this].concat(arrayOfLists));
    };

    List.prototype.bind = function(f) {
        return _bind.call(null, this, f);
    };

    List.prototype.pure = _pure;

    List.prototype.match = function(f) {
        return f.call(null, this.contents);
    };

    List.prototype.head = function() {
        return this.contents[0];
    };

    // just for fun
    List.prototype.tail = function() {
        var result = new Array(this.contents.length-1);
        for (var i=1;i<this.contents.length;i++) {
            result[i-1] = this.contents[i];
        }
        return new List(result);
    };

    List.prototype.cons = function(v) {
        return new List([v].concat(this.contents));
    };

    return {List:List,pure:_pure, bind:_bind};

})();
