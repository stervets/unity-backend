var Clients        = require('./clients/collection'),
    Rooms          = require('./rooms/collection'),
    TestUserConfig = require('./config/test-config-level2');

module.exports = Backbone.Model.extend({
    rooms  : null,
    prepare: ['initCollections'],

    handlers           : {},
    feHandlersCallbacks: {},

    socketHandlers: {
        register(socket, clientProps) {
            var room,
                roomId = clientProps.room;

            if (!roomId) {
                console.log("No room ID. Can't register client");
                socket.disconnect();
                return;
            }

            if (!(room = this.rooms.get(roomId))) {
                room             = this.rooms.add({
                    id: roomId
                });
                room.application = this;
            }

            socket.room = room;

            var client = new Clients.prototype.model({
                id         : socket.id,
                type       : clientProps.type,
                development: !!clientProps.development
            });

            client.room       = room;
            client.socket     = socket;
            client.socketRoom = `${roomId}-${clientProps.type}`;

            socket.join(roomId);
            socket.join(client.socketRoom);

            room.addClient(client);

            if (clientProps.development) {
                socket.room.registerAPI(TestUserConfig);
            }
            console.log(`Client "${client.get('type')}" in room ${room.id} started. Socket id: ${socket.id}`);
        },

        registerAPI(socket, config) {
            if (socket.room) {
                socket.room.registerAPI(config);
            } else {
                console.warn("registerAPI: Socket has no room");
            }
        },

        disconnect(socket) {
            var client = socket.room &&
                         Object.values(socket.room.clients).reduce((client, clients) => {
                             !client && (client = clients.get(socket.id));
                             return client;
                         }, null);
            if (client) {
                client.destroy();
                client.room.onClientDestroy(client);
            }
            console.log(`Socket ${socket.id} disconnected`);
        },

        ServerLog(socket, data) {
            //var client = this.clients.get(socket.id);
            console.log(`#log>`, data);
        },

        FinishLevel(socket, data) {
            if (socket.room) {
                socket.room.sendEvent('editor', 'levelComplete');
            }
        },

        removeActor(socket, data) {
            if (socket.room) {
                if (data.isStatic) {
                    socket.room.sendEvent('editor', 'removeActor', {
                        id: data.id
                    });
                    return;
                }
                var actor = socket.room.actors.get(data.id);
                if (actor) {
                    actor.destroy();
                } else {
                    console.warn(`Actor ${data.id} not found`);
                }
            } else {
                console.warn("removeActor: Socket has no room");
            }
        },

        addActor(socket, data) {
            if (socket.room) {
                if (socket.room.config) {
                    if (data.isStatic) {
                        return;
                    }
                    var apiName = data.api.split('.').pop().split('_')[1],
                        api;
                    if (!(api = socket.room.config.api[apiName])) {
                        console.log(`API "${apiName}" not found`);
                        return;
                    }

                    socket.room.addActor({
                        id        : data.id,
                        name      : data.name,
                        apiName,
                        api,
                        scriptName: data.script,
                        isPublic  : !!data.isPublic,
                        metadata  : data.metadata || ''
                    });

                    console.log(`Actor ${data.name} added. ID: ${data.id}, API: ${apiName}, Script: ${data.script}`);
                } else {
                    console.warn("Room has no config");
                }
            } else {
                console.warn("addActor: Socket has no room");
            }
        },

        ReloadLevel(socket, data) {
            if (socket.room) {
                socket.room.loadUnityLevel();
            } else {
                console.warn("ReloadLevel: Socket has no room");
            }
        },

        unityFeResponse(socket, data) {
            if (socket.room) {
                data && data.id && this.feHandlersCallbacks[data.id] && this.feHandlersCallbacks[data.id](data);
            } else {
                console.warn("levelUnloaded: Socket has no room");
            }
        },

        CaptureKeyboard(socket, capture) {
            if (socket.room) {
                socket.room.send('unity', 'captureKeyboard', {
                    capture: !!capture
                });
            } else {
                console.warn("CaptureKeyboard: Socket has no room");
            }
        },

        RunAllScripts(socket, data) {
            if (socket.room) {
                socket.room.runAllScripts(data.except, data.scripts);
            } else {
                console.warn("RunAllScripts: Socket has no room");
            }
        },

        onLevelLoaded(socket, data) {
            if (socket.room) {
                socket.room.sendEvent('editor', 'levelLoaded', {
                    result  : data,
                    metadata: socket.room.config && socket.room.config.metadata
                });
                socket.room.isLoadingLevel = false;
            } else {
                console.warn("onLevelLoaded: Socket has no room");
            }
        },

        ScriptStop(socket, data) {
            this.checkActorAndRun(socket, data, (actor) => {
                actor.scriptStop();
            });
        },

        ScriptRun(socket, data) {
            this.checkActorAndRun(socket, data, (actor) => {
                actor.scriptRun(data.script);
            });
        },

        /*
         ScriptStep(socket, data) {
         this.checkActorAndRun(socket, data, (actor) => {
         actor.scriptStep(data.script);
         });
         },
         */

        RunCallback(socket, data) {
            this.checkActorAndRun(socket, data, (actor) => {
                actor.runCallbackInAsyncFunction(data.callback, data.res);
            });
        },

        a(socket, data) {
            if (socket.room) {
                var actor = socket.room.actors.get(data.id);
                if (actor) {
                    actor.resolve && actor.resolve(data.res);
                } else {
                    console.log(`Unity response error: Actor ${data.id} not found`);
                }
            } else {
                console.warn("A: Socket has no room");
            }
        },

        e(socket, data) {
            if (socket.room) {
                var actors;
                if (data.id) {
                    actors = socket.room.actors.get(data.id);
                    if (!actors) {
                        console.warn(`Event: Actor ${data.id} not found`);
                        return;
                    }
                    actors = [actors];
                } else {
                    actors = data.except ? socket.room.actors.filter((actor) => actor.id !== data.except) : socket.room.actors.models;
                }
                actors.forEach((actor) => {
                    actor && actor.fireEvent(data.event, data.data);
                });
            } else {
                console.warn("Event: Socket has no room");
            }
        },

        /*
         Frontend request
         */
        feReq(socket, request) {
            if (!(_.isObject(request) && request.id && request.com)) {
                console.warn('Wrong data in FE request');
                return;
            }
            if (this.feHandlers[request.com]) {
                this.feHandlers[request.com].call(this, socket, request);
            } else {
                this.sendFrontendResponse(socket, request.id, null, `FE request handler "${request.com}" not found`);
            }
        }
    },

    checkActorAndRun(socket, data, callback) {
        if (!(data && data.id)) {
            console.warn("Need actor id");
            return;
        }
        if (socket.room) {
            var actor = socket.room.actors.get(data.id);
            if (actor) {
                callback(actor);
            } else {
                console.warn(`Actor ${data.id} not found`);
            }
        } else {
            console.warn("checkActorAndRun: Socket has no room");
        }
    },

    sendFrontendResponse(socket, id, data, error) {
        socket.emit('feRes', { id, data, error });
    },

    feHandlers: {
        test(socket, request) {
            this.sendFrontendResponse(socket, request.id, request.data.a + request.data.b);
        },

        ScriptStep(socket, request) {
            this.checkActorAndRun(socket, request.data, async (actor) => {
                this.sendFrontendResponse(socket, request.id, !!(await actor.scriptStep(request.data.script)));
            });
        },

        unloadLevel(socket, request) {
            if (socket.room) {
                socket.room.destroyAllActors();
                socket.room.send('unity', 'unloadLevel', {
                    id: request.id.toString()
                });
                this.feHandlersCallbacks[request.id] = () => {
                    this.sendFrontendResponse(socket, request.id);
                    delete this.feHandlersCallbacks[request.id];
                }
            } else {
                console.warn("ReloadLevel: Socket has no room");
            }
        },

        ActorCreate(socket, request) {
            if (socket.room) {
                console.log(request.data);
                var actor = socket.room.getActorsProperties(request.data)[0];
                socket.room.send('unity', 'ActorCreate', {
                    id: request.id.toString(),
                    actor
                });
                this.feHandlersCallbacks[request.id] = (res) => {
                    actor.properties = res.properties;
                    actor            = _.extend(socket.room.parseActorsProperties(actor)[0], {
                        id      : res.actorId || 0,
                        metadata: request.data.metadata
                    });

                    this.sendFrontendResponse(socket, request.id, actor);
                    delete this.feHandlersCallbacks[request.id];

                    //actor.properties.position.y = 10;
                    //actor.properties.position.x = 3;
                    /*
                    actor.properties.name = 'Bot2';

                    this.feHandlers.ActorSet.call(this, socket, {
                        id  : 764583343,
                        data: actor
                    });
                    */
                };
            } else {
                console.warn("ActorCreate: Socket has no room");
            }
        },

        ActorDestroy(socket, request) {
            if (socket.room) {
                socket.room.send('unity', 'ActorDestroy', {
                    id     : request.id.toString(),
                    actorId: request.data.id || 0
                });

                this.feHandlersCallbacks[request.id] = (res) => {
                    console.log({
                        result  : res.result,
                        metadata: request.data.metadata
                    });
                    this.sendFrontendResponse(socket, request.id, {
                        result  : res.result,
                        metadata: request.data.metadata
                    }, !res.result && 'Actor not found');
                    delete this.feHandlersCallbacks[request.id];
                }
            } else {
                console.warn("ActorDestroy: Socket has no room");
            }
        },

        ActorSet(socket, request) {
            if (socket.room) {
                var actor = socket.room.getActorsProperties(request.data)[0];
                socket.room.send('unity', 'ActorSet', {
                    id: request.id.toString(),
                    actor
                });

                this.feHandlersCallbacks[request.id] = (res) => {
                    if (!res.actor) {
                        this.sendFrontendResponse(socket, request.id, {
                            actor   : res.actor,
                            metadata: request.metadata
                        }, "Actor not found");
                        return;
                    }

                    actor.properties = res.actor;
                    actor            = socket.room.parseActorsProperties(actor)[0];

                    this.sendFrontendResponse(socket, request.id, actor);
                    delete this.feHandlersCallbacks[request.id];
                };
            } else {
                console.warn("ActorSet: Socket has no room");
            }
        },
    },

    sendRoomQuery(socketRoom, actorId, com, vars) {
        var data = {
            id: actorId,
            com,
            vars
        };
        this.io.to(socketRoom).emit('q', data);
    },

    sendRoomEvent(socketRoom, com, vars) {
        var data = {
            com,
            vars
        };
        this.io.to(socketRoom).emit('e', data);
    },

    sendRoom(socketRoom, com, vars) {
        this.io.to(socketRoom).emit(com, vars);
    },

    initCollections() {
        this.rooms = new Rooms();
    },

    onConnection(socket) {
        console.log(`Socket ${socket.id} connected`);
        Object.keys(this.socketHandlers).forEach((handlerName) => {
            socket.on(handlerName, (...attrs) => {
                this.socketHandlers[handlerName].call(this, socket, ...attrs);
            });
        });
    },

    launch(opts) {
        this.io = require('socket.io').listen(opts.port);
        console.log(`listening on *:${opts.port}`);
        this.io.sockets.on('connection', this.onConnection);
    }
});
