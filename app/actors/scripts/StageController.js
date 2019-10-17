/*
var i = 0;

var testEvent = function(a){
    console.log('EVENT:', a);
}

var a = function () {
    console.log('I', i++);
    var int = setTimeout(a, 500, {a:1});
    if (i > 5) {
        clearTimeout(int);
    }
};
a();

*/

var femaleId = create('CharacterFemale', 'CharacterFemale', {
    x: 0,
    y: 0,
    z: 0,
    angle: 0
});
console.log("Female crated. ActorId:", femaleId);
