function makeHash(source) {
    var hash = 0;
    if (source.length === 0) return hash;
    for (var i = 0; i < source.length; i++) {
        var char = source.charCodeAt(i);
        hash     = ((hash << 5) - hash) + char;
        hash     = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

move(2);

var timeStart = Date.now();
for (var i = 0; i < 100; i++) {
    makeHash('TEST' + i);
}
console.log(Date.now() - timeStart);
