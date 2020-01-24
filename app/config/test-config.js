module.exports = {
    level  : 'scifi/level1',
    desc: 'Pick up card and go to the door',

    scripts: [
        {
            name: 'CharacterController',
            isAdmin: false,
            content: `
                move(3);
                turn(DIRECTION.LEFT);
                turn(DIRECTION.RIGHT);
            `
        }
    ],
    api    : {
        Character: {
            //TODO: think about make other functions injection (to another actor?)
            properties: {
                DIRECTION: {
                    RIGHT: 0,
                    LEFT : 1,
                    BACK : 2
                },
            },

            methods   : {
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
                            name: 'distance',
                            type: 'int',
                            desc: 'Use DIRECTION.LEFT, DIRECTION.RIGHT or DIRECTION.BACK as parameter'
                        }
                    ]
                },

                pick: {
                    desc: 'Pick up an item from floor'
                }
            }
        }
    }
};
