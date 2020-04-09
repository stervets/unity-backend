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
            api    : 'Character',
            content: `
            console.log('X1 = ', x);
            console.log('X2 = ', x);
            console.log('X3 = ', x);
               move(1);
               turn(1);
               console.log('X4 = ', x);
               push();
               console.log('X5 = ', x);
               turn(2);
               push();
               turn(2);
               move(2);
               turn(2);
               move(2);
            `
        }
    ],
    api    : {
        Character: {
            scripts   : [{
                name   : 'CharacterController',
                isAdmin: false,
                content: 'asd'
            }],
            //TODO: think about make other functions injection (to another actor?)
            properties: {
                x        : 'getter:push',
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

                push: {
                    desc: 'Push the button',
                }
            }
        }
    }
};
