/*
 int
 float
 string
 bool
 */

module.exports = {
    level: 'scifi/level1',
    desc : 'Pick up card and go to the door',

    scripts: [
        {
            name   : 'CharacterController',
            isAdmin: false,
            api: 'Character',
            content: `
                console.log('Script started');
                
                var i = 0;
                while(true){
                    move(1);
                    move(1);
                    turn(DIRECTION.BACK);
                    //console.log(i++);
                }
                
                while(false){
                move(4);
                turn(DIRECTION.LEFT);
                move(2);
                push();
                
                turn(DIRECTION.BACK);
                move(2);
                turn(DIRECTION.LEFT);
                move(2);
                
                wait(500);
                
                turn(DIRECTION.BACK);
                move(2);
                turn(DIRECTION.RIGHT);
                move(2);
                push();
                
                turn(DIRECTION.BACK);
                move(2);
                
                turn(DIRECTION.RIGHT);
                move(4);
                turn(DIRECTION.BACK);
                wait(500);
               
                }
                
                console.log('Script finished');
            `
        }
    ],
    api    : {
        Character: {
            scripts: [{
                name   : 'CharacterController',
                isAdmin: false,
                content: 'asd'
            }],
            //TODO: think about make other functions injection (to another actor?)
            properties: {
                DIRECTION: {
                    NONE : 0,
                    RIGHT: 1,
                    LEFT : 2,
                    BACK : 3
                }
            },

            methods: {
                move: {
                    desc  : 'Move character forward for a given distance',
                    params: [
                        {
                            name: 'distance',
                            type: 'int',
                            desc: 'Distance to move'
                        }
                    ]
                },

                turn: {
                    desc  : 'Turn character relative to himself',
                    params: [
                        {
                            name: 'side',
                            type: 'int',
                            desc: 'Use DIRECTION.LEFT, DIRECTION.RIGHT or DIRECTION.BACK as parameter'
                        }
                    ]
                },

                push:{
                    desc  : 'Push the button',
                }
            }
        }
    }
};
