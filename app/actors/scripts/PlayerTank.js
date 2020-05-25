//while(true){
var targets = scan([TYPE.ENEMY]);
console.log(targets.map(function(a){return a.name}));

setTimeout(function(){
    sendMessage("Hi!");
    console.log("sent");
}, 1000);


//}
