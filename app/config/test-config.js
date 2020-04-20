/*
 int
 float
 string
 bool
 */

module.exports = {
    name: 'my super level 1',
    desc : 'Push the button and go to the door',

    unity: {
        name    : 'scifi/level1',
        bundle  : '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-546f505ffd87',
        manifest: '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-15234613',
    },

    scripts: {
        CharacterController: {
            content: `
                move(4);
                turn(2);
                move(20);
                push();
                turn(3);
                move(2);
                turn(2);
                move(3);
            `
        }
    },
    api    : {
        Character: {
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

                push: {
                    desc: 'Push the button',
                }
            }
        }
    }
};
