var Clients        = require('./clients/collection'),
    Rooms          = require('./rooms/collection'),
    TestUserConfig = require('./config/test-config');

module.exports = Backbone.Model.extend({
    rooms  : null,
    prepare: ['initCollections'],

    handlers: {},

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
                id  : socket.id,
                type: clientProps.type
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

            client.start();
            console.log(`Client "${client.get('type')}" in room ${room.id} started`);
        },

        registerAPI(socket, config) {
            if (socket.room) {
                socket.room.registerAPI(config);
            } else {
                console.warn("Socket has no room");
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
                console.log("FINISHED LEVEL!");
            }
        },
        addActor(socket, data) {
            if (socket.room) {

                if (socket.room.config) {
                    var script = socket.room.config.scripts.find((script) => {
                        return data.script == script.name;
                    });

                    if (script) {
                        script = script.content;
                    } else {
                        console.log(`Script "${data.script}" not found`);
                        return;
                    }

                    var apiName = data.api.split('_')[1], api;
                    if (!(api = socket.room.config.api[apiName])) {
                        console.log(`API "${apiName}" not found`);
                        return;
                    }

                    socket.room.addActor({
                        id        : data.id,
                        name      : data.name,
                        api,
                        script,
                        scriptName: data.script,
                        autorun   : !!data.autorun
                    });

                    console.log(`Actor ${data.name} added. ID: ${data.id}, API: ${apiName}, Script: ${data.script}`);
                } else {
                    console.warn("Room has no config");
                }
            } else {
                console.warn("Socket has no room");
            }
        },

        RunAllScripts(socket, data) {
            if (socket.room) {
                console.log(data);
                var except = [];
                if (data && data.except) {
                    except = data.except.toString().split(',').reduce((res, actorId) => {
                        actorId = parseInt(actorId.trim());
                        if (actorId && !~except.indexOf(actorId)) {
                            res.push(actorId);
                        }
                        return res;
                    }, []);
                }
                socket.room.runAllScripts(except);
            } else {
                console.warn("Socket has no room");
            }
        },

        ScriptStop(socket, data) {
            this.checkActorAndRun(socket, data, (actor) => {
                actor.scriptStop();
            });
        },

        ScriptRun(socket, data) {
            this.checkActorAndRun(socket, data, (actor) => {
                actor.scriptRun();
            });
        },

        ScriptStep(socket, data) {
            this.checkActorAndRun(socket, data, (actor) => {
                actor.scriptStep();
            });
        },

        a(socket, data) {
            var actor = socket.room.actors.get(data.id);
            if (actor) {
                actor.resolve && actor.resolve(data.res);
            } else {
                console.log(`Unity response error: Actor ${data.id} not found`);
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
            console.log('RECEIVED DATA', request);
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
            console.warn("Socket has no room");
        }
    },

    sendFrontendResponse(socket, id, data, error) {
        socket.emit('feRes', { id, data, error });
    },

    feHandlers: {
        test(socket, request) {
            this.sendFrontendResponse(socket, request.id, request.data.a + request.data.b);
        }
    },

    /*
     sendClientQuery(client, com, vars) {
     return new Promise((resolve) => {
     client.resolve = resolve;
     client.socket.emit('q', { id: 0, com, vars });
     });
     },
     */

    sendRoomQuery(socketRoom, actorId, com, vars) {
        var data = {
            id: actorId,
            com,
            vars
        };
        console.log('sendRoomQuery', data);
        this.io.to(socketRoom).emit('q', data);
    },

    sendRoom(socketRoom, com, vars) {
        console.log('sendRoom', com, vars);
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
        var http = require('http').createServer(opts.express);
        this.io  = require('socket.io')(http);

        this.io.on('connection', this.onConnection);

        http.listen(opts.port, () => {
            console.log(`listening on *:${opts.port}`);
        });
    }
});
