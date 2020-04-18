var types  = {
        TANK  : 1,
        TURRET: 2
    },

    config = {
        name: 'Level 2',
        desc : 'Pick up card and go to the door',

        unity: {
            name    : 'scifi/level2',
            bundle  : '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-546f505ffd87',
            manifest: '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-15234613',
        },

        scripts: [
            {
                name   : 'TankController',
                api    : 'Tank',
                content: `
                function rand(min, max) {
                     return Math.random() * (max - min) + min;
                }
                
                move();
                //motor(1,1);
                
                while(false){
                    //motor(0,0);
                    moveToXY(Math.round(rand(-20, 20)), Math.round(rand(-20, 20)));
                    motor(rand(-0.5, 0.5)*2, rand(-0.5, 0.5)*2);
                    console.log('Position', position.x, position.y, speed);
                    wait(Math.round(rand(2000, 4000)));
                    console.log('Speed', speed);
                }
            `
            },


            {
                name   : 'TankBotController',
                api    : 'Tank',
                content: `
                while(true){
                    move(5);
                    motor(1,-1);
                    wait(2500);
                }
            `
            }
        ],

        api: {
            Entity: {
                properties: {
                    TYPE: types,
                    position: {
                        x: 'getter:GetX',
                        y: 'getter:GetY'
                    },
                    health: 'getter:GetHealth',
                    type : 'getter:Type'
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

                    moveTo: {
                        desc  : 'Move vehicle to given object',
                        params: [
                            {
                                name: 'id',
                                type: 'int',
                                desc: 'Object id'
                            },

                            {
                                name: 'distance',
                                type: 'int',
                                desc: 'Stop on specified distance',
                                default: 2
                            }
                        ]
                    },

                    moveToXY: {
                        desc  : 'Move vehicle to given coordinates',
                        params: [
                            {
                                name: 'x',
                                type: 'float',
                                desc: 'X coord'
                            },

                            {
                                name: 'y',
                                type: 'float',
                                desc: 'Y coord'
                            }
                        ]
                    },

                    turn: {
                        desc  : 'Turn relative angle',
                        params: [
                            {
                                name: 'angle',
                                type: 'float',
                                desc: 'Angle'
                            }
                        ]
                    },

                    turnTo: {
                        desc  : 'Turn vehicle to given object',
                        params: [
                            {
                                name: 'id',
                                type: 'int',
                                desc: 'Object id'
                            }
                        ]
                    },

                    turnToXY: {
                        desc  : 'Turn vehicle to given coordinates',
                        params: [
                            {
                                name: 'x',
                                type: 'float',
                                desc: 'X coord'
                            },

                            {
                                name: 'y',
                                type: 'float',
                                desc: 'Y coord'
                            }
                        ]
                    },

                    turnAbsolute: {
                        desc  : 'Turn absolute angle',
                        params: [
                            {
                                name: 'angle',
                                type: 'float',
                                desc: 'Angle'
                            }
                        ]
                    },

                    scan: {
                        desc  : 'Objects scanner',
                        params: [
                            {
                                name: 'type',
                                type: 'int',
                                desc: 'Object type'
                            },
                            {
                                name   : 'angle',
                                type   : 'int',
                                desc   : 'Scanner angle',
                                default: 360
                            },
                            {
                                name   : 'distance',
                                type   : 'float',
                                desc   : 'Scanner distance',
                                default: 1000
                            }
                        ]
                    },

                    createDummy: {
                        desc  : 'Create dummy object on given coordinates',
                        params: [
                            {
                                name: 'x',
                                type: 'float',
                                desc: 'X coord'
                            },

                            {
                                name: 'y',
                                type: 'float',
                                desc: 'Y coord'
                            },

                            {
                                name: 'destroyTimer',
                                type: 'int',
                                desc: 'Destroy after given milliseconds'
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
                    speed: 'getter:GetSpeed'
                },

                methods: {
                    shoot: {
                        desc: 'Shoot weapon'
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
