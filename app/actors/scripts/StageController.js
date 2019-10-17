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
console.log('CREATE ScriptDrivenCharacterFemale');
create('ScriptDrivenCharacterFemale', 'FemaleController', {
    x: 0,
    y: 0,
    z: 0,
    angle: 0
});
console.log('DONE');
