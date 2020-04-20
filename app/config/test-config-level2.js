var config = {
    name: 'Level 2',
    desc: 'Pick up card and go to the door',

    unity: {
        name    : 'scifi/level2',
        bundle  : '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-546f505ffd87',
        manifest: '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-15234613',
    },

    scripts: {
        TankController: {
            content: `
                addEventListener('click', function(x,y){
                    createDummy(x,y);
                    moveXY(x,y, function(){
                    
                    });
                })       
            `
        },

        TankBotController: {
            content: `
            /*
                while(false){
                    move(5);
                    motor(1,-1);
                    wait(1700);
                }
                */
            `
        }
    },

    api: {
        Entity: {
            properties: {
                TYPE    : {
                    TANK  : 1,
                    TURRET: 2
                },
                position: {
                    x: 'getter:GetX',
                    y: 'getter:GetY'
                },
                health  : 'getter:GetHealth',
                type    : 'getter:Type'
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
                        },

                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
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
                            name   : 'distance',
                            type   : 'int',
                            desc   : 'Stop on specified distance',
                            default: 2
                        },

                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
                        }
                    ]
                },

                moveXY: {
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
                        },

                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
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
                            name   : 'destroyTimer',
                            type   : 'int',
                            desc   : 'Destroy after given milliseconds',
                            default: 10
                        }
                    ]
                },
            }
        },

        Tank: {
            extends   : 'Vehicle',
            name      : 'My super tank',
            properties: {
                speed: 'getter:GetSpeed'
            },

            methods: {
                shoot: {
                    desc: 'Shoot weapon'
                }
            }
        }
    }
};

module.exports = config;
