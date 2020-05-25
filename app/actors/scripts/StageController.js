var wallLine = function(x, y, len, inverted, double){
    var x2 = x+len;
    for(var i=x;i<x2;i++){
        inverted ? createWall(i,y) : createWall(y,i);
        if (double){
            inverted ? createWall(i,y) : createWall(y,i);
        }
    }
}

wallLine(-12, 0, 3, false, true);
wallLine(9, 0, 3, false, true);

wallLine(-12, 0, 3, true, true);
wallLine(9, 0, 3, true, true);

wallLine(0, -0.2, 2, false, true);
wallLine(0, 0.75, 2, false, true);


wallLine(4, 4, 1, false, true);
wallLine(-4, 4, 1, false, true);
wallLine(4, -4, 1, false, true);
wallLine(-4, -4, 1, false, true);

createTank('Bot1', 3,10,-90, 'BotTank', TYPE.ENEMY);
createTank('Bot2', -3,-10,90, 'BotTank', TYPE.ENEMY);


createTank('Bot3', 3,-10,70, 'BotTank', TYPE.ENEMY);
createTank('Bot4', -3, 10,50, 'BotTank', TYPE.ENEMY);

addEventListener("actorDestroyed", function(){
    console.log("destroyed");
    var tank = createTank('Bot'+random(0xFFFFFF), random(-8, 8), random(-8, 8),180, 'BotTank', TYPE.ENEMY);
    cameraFollow(tank, 5);
});

//createTank('Bot2', 0,-10,0, 'TankBotController', TYPE.ENEMY);
//createTank('Bot3', -5,0,90, 'TankBotController', TYPE.ENEMY);

//var tank = createTank('PlayerTank', 10,0,-90, 'TankController', TYPE.FRIEND, true);
//cameraFollow(tank, 5);
