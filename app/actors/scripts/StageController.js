var wallLine = function (x, y, len, inverted, double) {
    return;
    var x2 = x + len;
    for (var i = x; i < x2; i++) {
        inverted ? createWall(i, y) : createWall(y, i);
        if (double) {
            inverted ? createWall(i, y) : createWall(y, i);
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


var createAndDestroy = function () {
    var tank = createTank('Bot2', 0, 0, 0, 'BotTank', TYPE.ENEMY);
    cameraFollow(tank, 5);
    setTimeout(function () {
        damage(tank, 100);
        setTimeout(createAndDestroy, 3000);
    }, 5000);
};
createAndDestroy();
//cameraSet(0,-5,5,0,30);


//var tank = createTank('Bot2', 0, 0, 0, 'BotTank', TYPE.ENEMY);
//cameraFollow(tank, 4);

//createTank('Bot1', 3,10,-90, 'BotTank', TYPE.ENEMY);
//var tank = createTank('Bot2', -3,-10,90, 'BotTank', TYPE.ENEMY);

//createTank('Bot3', 3,-10,70, 'BotTank', TYPE.ENEMY);

// var tank;
// for(var i=0;i<5;i++) {
//     tank = createTank('Bot' + i, random(-10, 10), random(-10, 10), 0, 'BotTank', TYPE.ENEMY);
// }
//
// cameraFollow(tank, 5);
// //
// addEventListener("actorDestroyed", function(){
//     var tank = createTank('Bot'+random(0xFFFFFF), random(-8, 8), random(-8, 8),180, 'BotTank', TYPE.ENEMY);
//     cameraFollow(tank, 5);
// });

//createTank('Bot2', 0,-10,0, 'TankBotController', TYPE.ENEMY);
//createTank('Bot3', -5,0,90, 'TankBotController', TYPE.ENEMY);

//var tank = createTank('PlayerTank', 10,0,-90, 'TankController', TYPE.FRIEND, true);
//cameraFollow(tank, 5);
