var enemies = scan([TYPE.TANK], 360, 1000, false);

if (enemies.length){
    turnXY(enemies[0].x, enemies[0].y);

    while(true){
        shoot();
        wait(1000);
    }

}else{
    console.log('ENEMY NOT FOUND!');
}
