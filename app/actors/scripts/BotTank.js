var pos = position;

move(10);
turnXY(pos.x, pos.y);
move(10);

/*
 var points = [
 [3, 3],
 [-3, -3],
 [-3, 3],
 [3, -3]
 ];

 var fire = function(){
 shoot();
 setTimeout(fire, 1000);
 };

 var moveNext = function () {
 var timer = 0;
 moveXY(random(-8, 8), random(-8, 8), 0, function () {
 clearTimeout(timer);
 moveNext();
 });

 timer = setTimeout(stop, 5000);
 };
 moveNext();
 console.log(color);
 */
//fire();

/*
 console.log(name);

 var points    = [
 [8, 8],
 [-8, -8],
 [-8, 8],
 [8, -8]
 ],
 nextState = 'search',
 target;

 var searchEnemyTimer;

 var log = function(message){
 console.log(name, message);
 };

 var states = {
 search: function (nextPoint) {
 var searchEnemy = function () {
 clearTimeout(searchEnemyTimer);
 var scanned = scan([TYPE.TANK])[0];
 if (scanned) {
 target = scanned;
 nextState = 'fire';
 stop();
 } else {
 searchEnemyTimer = setTimeout(searchEnemy, 1000);
 }
 };

 var point = nextPoint || points[random(3)];
 moveXY(point[0], point[1], 0, function () {
 clearTimeout(searchEnemyTimer);
 states[nextState]();
 });

 searchEnemy();
 },

 fire: function (search) {
 if (target){
 var scanned = scan([TYPE.TANK], 80)[0];
 if (scanned) {
 target = scanned;
 turnXY(target.x, target.y, function () {
 var t = scanById(target.id);
 if (t) {
 target = t;
 turnXY(t.x, t.y, function () {
 shoot();
 setTimeout(function () {
 nextState = 'fire';
 states.fire();
 }, 1000);
 });
 } else {
 target    = null;
 nextState = 'search';
 states.search();
 }
 });
 }else{
 nextState = 'strafe';
 states.strafe();
 }
 }
 },

 strafe: function(){
 nextState = 'search';
 moveXY(position.x+random(-2, 2), position.y+random(-2, 2),0, function () {
 console.log("next", nextState);
 states[nextState]();
 });
 }

 };

 addEventListener("damage", function(){
 nextState = 'strafe';
 stop();
 states[nextState]();

 });

 states[nextState]();
 */
