var that = this;
var tanks=[];

var onSelectActor = function(tankID){

    tanks.push(createTank('ENEMY-MY', 0,0,-90,'BotTank',TYPE.ENEMY));

    console.log('STAGECONTROLLER->' + tankID);
    for(i=0; i<that.tanks.length; i++){
        if (that.tanks[i] === tankID){
            that.cameraFollow(tankID, 4, cameraAngle+=90);
        }
    }
}
addEventListener('selectActor', onSelectActor);

for(var i=-5;i<5;i++){
    createWall(0,i * 1.5); //создаем стены
}

console.log('create player tank');

// создаем танк x = -5, y = 0, angle = 0, имяСкрипта, группа (прост константа) == 1, isPublic == true
var playerTank = createTank('PLAYER',-10,0,0,'PlayerTank',TYPE.FRIEND,true);
tanks.push(playerTank);

console.log('create enemies takns');

// создаем ещё танк x = 5, y = 0, angle = -90, имяСкрипта - TankBotController, группа, isPublic == false (default)
tanks.push(createTank('ENEMY-1', 10,0,-90,'BotTank',TYPE.ENEMY));
tanks.push(createTank('ENEMY-2', 0,-10,-90,'BotTank',TYPE.ENEMY));
tanks.push(createTank('ENEMY-3', 0,10,-90,'BotTank',TYPE.ENEMY));

var cameraZ = 10,
    cameraAngle = -90;

// ф-ция для следования камеры с меняющимся углом раз в 3 секунды
var follow = function(){
    // следовать за объектом
    // id объекта, дистанция до объекта == 4, угол вращения вокруг объекта
    cameraFollow(playerTank, 4, cameraAngle+=90);
    //setTimeout(follow, 3000);
};

// двигаем камеру
var moveCamera = function(){
    // установить координаты и угол камеры
    // x, y, z, угол по горизонтали == 90, угол по вертикали == 20
    cameraSet(-10-cameraZ, 0, (cameraZ-=0.1), 90, 20);

    // ждем пока камера не опустится до y == 2
    if (cameraZ>2){
        setTimeout(moveCamera, 0);
    }else{
        console.log('camera follow');
        // запускаем функцию следования за объектом
        follow();
    }
};

moveCamera();
