var config = {
    level: 'scifi/level1',
    desc : 'Pick up card and go to the door',

    scripts: [
        {
            name   : 'TankController',
            isAdmin: false,
            api    : 'Tank',
            content: `
               motor(1,1);
            `
        }
    ],

    api: {
        Entity: {
            properties: {
                TANK  : 1,
                TURRET: 2
            }
        },

        Vehicle: {
            extends: 'Entity',

            properties: {
                DIRECTION: {
                    FRONT: 0,
                    LEFT : 1,
                    RIGHT: 2,
                    BACK : 3
                }
            },

            methods: {
                motor: {
                    desc  : 'Motor direct control',
                    params: [
                        {
                            name: 'left',
                            type: 'float',
                            desc: 'Left motor'
                        },
                        {
                            name: 'right',
                            type: 'float',
                            desc: 'Right motor'
                        }
                    ]
                },

                move: {
                    desc  : 'Move vehicle forward or backward a set number of meters. Positive values indicate a forward movement, while negative indicates backward.',
                    params: [
                        {
                            name: 'distance',
                            type: 'float',
                            desc: 'Distance to move'
                        }
                    ]
                },

                radar: {
                    desc  : 'Search an object',
                    params: [
                        {
                            name: 'type',
                            type: 'int',
                            desc: 'Object type'
                        },
                        {
                            name   : 'angle',
                            type   : 'int',
                            desc   : 'Radar angle',
                            default: 360
                        },
                        {
                            name   : 'distance',
                            type   : 'float',
                            desc   : 'Radar distance',
                            default: 1000
                        }
                    ]
                },
            }
        },

        Tank: {
            public    : true,
            extends   : 'Vehicle',
            title     : 'My super tank',
            properties: {
                type: config.api.Entity.properties.TANK,
                color: 'red'
            },

            methods: {
                shoot: { //это, допустим, уникальный метод только для танка
                    desc: 'Motor direct control'
                }
            },

            events: {
                onClick: {
                    desc: 'On Click'
                }
            }
        },

        Tank2: {
            public    : true,
            extends   : 'Tank',
            title     : 'My super tank 2',
            properties: {
                color: 'green'
            }
        }
    }
};

module.exports = config;
