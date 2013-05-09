module.exports = (function() {

    var _mempty = function() {
        return {};
    };

    var _mappend = function(anObj, otherObj) {
        var result = {};
        for (var p in anObj) { result[p] = anObj[p]; }
        for (var p in otherObj) { result[p] = otherObj[p]; }
        return result;
    };
})();
