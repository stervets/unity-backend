var config = {
    name: 'Level 2',
    desc: 'Pick up card and go to the door',

    unity: {
        name    : 'scifi/level2',
        bundle  : '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-546f505ffd87',
        manifest: '/o/Unity%2F888283_apple_512x512.png?alt=media&token=2982afd0-7724-4f76-aea3-15234613',
    },

    scripts: {
        StageController: {
            content: loadScriptSync('StageController')
        },

        PlayerTank: {
            content: loadScriptSync('PlayerTank')
        },

        BotTank: {
            content: loadScriptSync('BotTank')
        }
    },

    api: {
        BaseObject: {
            properties: {
                TYPE: {
                    ALL     : 0,
                    //
                    TECH    : 1000,
                    BUILDING: 2000,
                    //
                    TANK    : 1001,
                    TURRET  : 1002,
                    //
                    WALL    : 2001,
                    TOWER   : 2002,
                    //
                    FRIEND  : 1,
                    ENEMY   : 2
                },

                id      : 'getter:GetId',
                name    : 'getter:GetName',
                position: {
                    x: 'getter:GetX',
                    y: 'getter:GetY'
                },
                health  : 'getter:GetHealth',
                group   : 'getter:GetGroup',
                types   : 'getter:GetTypes'
            },

            methods: {
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
                }
            }
        },

        Stage: {
            extends: 'BaseObject',
            methods: {
                createTank: {
                    desc  : 'Create tank. Returns object id',
                    params: [
                        {
                            name: 'name',
                            type: 'string',
                            desc: 'Tank name (should be unique!)'
                        },
                        {
                            name: 'x',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'y',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'angle',
                            type: 'float',
                            desc: 'Angle'
                        },
                        {
                            name: 'scriptName',
                            type: 'string',
                            desc: 'Script Name'
                        },
                        {
                            name: 'group',
                            type: 'int',
                            desc: 'Entity group 1-999. You can use TYPE.ENEMY(1), TYPE.FRIEND(2) or use your own.'
                        },
                        {
                            name: 'isPublic',
                            type: 'bool',
                            desc: 'Is available for other users'
                        }
                    ]
                },

                createWall: {
                    desc  : 'Create wall. Returns object id',
                    params: [
                        {
                            name: 'x',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'y',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'angle',
                            type: 'float',
                            desc: 'Angle'
                        },
                        {
                            name: 'disablePhysics',
                            type: 'bool',
                            desc: 'Make wall static w/o using physics, gravity, etc.'
                        }
                    ]
                },

                cameraFollow: {
                    desc  : 'Set camera following by object',
                    params: [
                        {
                            name: 'id',
                            type: 'int',
                            desc: 'Object id'
                        },
                        {
                            name   : 'distance',
                            type   : 'float',
                            desc   : 'Distance to object',
                            default: 3
                        },
                        {
                            name   : 'angle',
                            type   : 'float',
                            desc   : 'Camera around',
                            default: 0
                        }]
                },

                cameraSet: {
                    desc  : 'Set camera position',
                    params: [
                        {
                            name: 'x',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'y',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'z',
                            type: 'float',
                            desc: 'Z coord'
                        },
                        {
                            name: 'angleX',
                            type: 'float',
                            desc: 'Horizontal angle'
                        },
                        {
                            name: 'angleY',
                            type: 'float',
                            desc: 'Vertical angle'
                        }
                    ]
                },

                setPosition: {
                    desc  : 'Set object position',
                    params: [
                        {
                            name: 'actorId',
                            type: 'int',
                            desc: 'Actor id'
                        },
                        {
                            name: 'x',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'y',
                            type: 'float',
                            desc: 'X coord'
                        },
                        {
                            name: 'z',
                            type: 'float',
                            desc: 'Z coord'
                        },
                        {
                            name: 'angle',
                            type: 'float',
                            desc: 'Horizontal angle'
                        }
                    ]
                },

                destroy: {
                    desc  : 'Destroy object',
                    params: [
                        {
                            name: 'actorId',
                            type: 'int',
                            desc: 'Actor id'
                        }
                    ]
                },

                getActor: {
                    desc  : 'Get actor by id',
                    params: [
                        {
                            name: 'actorId',
                            type: 'int',
                            desc: 'Actor id'
                        }
                    ]
                },

                getActors: {
                    desc  : 'Get actors by types',
                    params: [
                        {
                            name: 'types',
                            type: 'array',
                            desc: 'Types'
                        },

                        {
                            name: 'addictive',
                            type: 'bool',
                            desc: 'Is addictive mode'
                        }
                    ]
                },

                damage: {
                    desc  : 'Add damage to object',
                    params: [
                        {
                            name: 'actorId',
                            type: 'int',
                            desc: 'Actor id'
                        },

                        {
                            name: 'damage',
                            type: 'float',
                            desc: 'Damage amount'
                        }
                    ]
                },

                trigger: {
                    desc  : 'Send event to object',
                    params: [
                        {
                            name: 'actorId',
                            type: 'int',
                            desc: 'Actor id. If actorId == 0, then event will be sent to all actors',
                        },

                        {
                            name: 'eventName',
                            type: 'string',
                            desc: 'Event name',
                        },

                        {
                            name: 'vars',
                            type: 'array',
                            desc: 'Parameters'
                        }
                    ]
                },

                finishLevel: {
                    desc  : 'Finish level',
                    params: [
                        {
                            name: 'vars',
                            type: 'object',
                            desc: 'Parameters'
                        }
                    ]
                },

                resetLevel: {
                    desc: 'Reset level'
                }
            }
        },

        Technic: {
            extends: 'BaseObject',
            methods: {
                scan: {
                    desc  : 'Objects scanner',
                    params: [
                        {
                            name: 'types',
                            type: 'array',
                            desc: 'Object type'
                        },
                        {
                            name   : 'angle',
                            type   : 'float',
                            desc   : 'Scanner angle',
                            default: 360
                        },
                        {
                            name   : 'distance',
                            type   : 'float',
                            desc   : 'Scanner distance',
                            default: 1000
                        },

                        {
                            name: 'addictive',
                            type: 'bool',
                            desc: 'Addictive mode'
                        },
                    ]
                },

                scanById: {
                    desc  : 'Objects scanner',
                    params: [
                        {
                            name: 'id',
                            type: 'int',
                            desc: 'Object id'
                        }
                    ]
                },

                sendMessage: {
                    desc  : 'Send message (available by addEventListener("message", function(a,b,c){})',
                    params: [
                        {
                            name: 'vars',
                            type: 'array',
                            desc: 'Parameters'
                        }
                    ]
                }
            }
        },

        Tank: {
            extends   : 'Technic',
            name      : 'My super tank',
            properties: {
                speed: 'getter:GetSpeed'
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
                            name   : 'distance',
                            type   : 'float',
                            desc   : 'Stop on specified distance'
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
                        },

                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
                        }
                    ]
                },

                turnXY: {
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
                        },
                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
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
                        },
                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
                        }
                    ]
                },

                stop: {
                    desc  : 'Stop any movement and call callback if async motion (move/turn) was called',
                },

                shoot: {
                    desc: 'Shoot weapon'
                }
            }
        }
    }
};

module.exports = config;
