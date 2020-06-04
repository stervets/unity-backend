console.log("HERE");
while(true){

    var x = random(-20, 20),
        y = random(-20, 20);
    console.log(x,y);
    createDummy(x,y);
    moveXY(x,y);
}
