var types  = {
        TANK  : 1,
        TURRET: 2
    },

    config = {
        name: 'Level 2',
        desc : 'Pick up card and go to the door',

        unity: {
            name    : 'scifi/level1',
            bundle  : '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-546f505ffd87',
            manifest: '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-15234613',
        },

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
                    TYPE: types
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
                isClass   : true,
                extends   : 'Vehicle',
                title     : 'My super tank',
                properties: {
                    type : types.TANK,
                    color: 'red'
                },

                methods: {
                    shoot: {
                        desc: 'Motor direct control'
                    }
                },

                events: {
                    onClick: {
                        desc: 'On Click'
                    }
                }
            }
        }
    };

module.exports = config;
