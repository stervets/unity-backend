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
                var i =0;
                var a = function(){
                    i++;
                    console.log('a', i);
                };
                function b(){
                    i++;
                    console.log('b', i);
                }
                a();
                b();
                i++;
                console.log('finish', i);
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