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
            content: `
                console.log('create wall');
                for(var i=-5;i<5;i++){
                    createWall(0,i); //создаем стены
                }
                
                console.log('create player tank');
                
                // создаем танк x = -5, y = 0, angle = 0, имяСкрипта, группа (прост константа) == 1, isPublic == true
                var playerTank = createTank(-5,0,0,'TankController',TYPE.FRIEND,true); 
                
                console.log('create enemies takns');
                
                // создаем ещё танк x = 5, y = 0, angle = -90, имяСкрипта - TankBotController, группа, isPublic == false (default)
                createTank(5,0,-90,'TankBotController',TYPE.ENEMY);
                createTank(-5,5,0,'TankBotController',TYPE.ENEMY);
                
                var cameraZ = 10,
                    cameraAngle = -90;
                
                // ф-ция для следования камеры с меняющимся углом раз в 3 секунды
                var follow = function(){
                    // следовать за объектом
                    // id объекта, дистанция до объекта == 4, угол вращения вокруг объекта
                    cameraFollow(playerTank, 4, cameraAngle+=90);
                    setTimeout(follow, 3000);
                };
                
                // двигаем камеру
                var moveCamera = function(){
                    // установить координаты и угол камеры
                    // x, y, z, угол по горизонтали == 90, угол по вертикали == 20
                    cameraSet(-10-cameraZ, 0, (cameraZ-=0.01), 90, 20);
                    
                    // ждем пока камера не опустится до y == 2
                    if (cameraZ>2){
                        setTimeout(moveCamera, 0);
                    }else{
                        console.log('camera follow');
                        // запускаем функцию следования за объектом
                        follow();
                    }
                };
                
                moveCamera();
            `
        },

        TankController: {
            content: `
            while(true){
                var x = random(-20, 20),
                    y = random(-20, 20);
                createDummy(x,y);
                moveXY(x,y);                
            } 
            `
        },

        TankBotController: {
            content: `
                /*
                while(true){
                    move(5);
                    motor(1,-1);
                    wait(1700);
                }
                */
            `
        }
    },

    api: {
        BaseObject: {
            properties: {
                TYPE: {
                    ALL   : 0,
                    //
                    TECH  : 1000,
                    WALL  : 1001,
                    //
                    TURRET: 1002,
                    TANK  : 1003,
                    //
                    FRIEND: 1,
                    ENEMY : 2
                },

                type: 'getter:getType'
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
                            name: 'distance',
                            type: 'float',
                            desc: 'Distance to object',
                            default: 3
                        },
                        {
                            name: 'angle',
                            type: 'float',
                            desc: 'Camera around',
                            default: 0
                        }                    ]
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
            }
        },

        Technic: {
            extends   : 'BaseObject',
            properties: {
                position: {
                    x: 'getter:GetX',
                    y: 'getter:GetY'
                },
                health  : 'getter:GetHealth',
                group   : 'getter:Group',

                methods: {
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
                        },

                        {
                            name: 'callback',
                            type: 'function',
                            desc: 'Make move function async and call this function on finish'
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

                shoot: {
                    desc: 'Shoot weapon'
                }
            }
        }
    }
};

module.exports = config;
