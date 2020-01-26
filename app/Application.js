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
            room.addClient(client);

            socket.join(roomId);
            socket.join(client.socketRoom);

            client.start();
            console.log(`Client "${client.get('type')}" in room ${room.id} started`);
            if (!room.id.indexOf('test')) {
                room.isTest = true;
                this.socketHandlers.setConfig.call(this, socket, TestUserConfig);
            }
        },

        setConfig(socket, config) {

            //console.log(config);
        },

        disconnect(socket) {
            var client = socket.room &&
                         Object.values(socket.room.clients).reduce((client, clients) => {
                             !client && (client = clients.get(socket.id));
                             return client;
                         }, null);
            if (client) {
                client.destroy();
                client.room.removeClient(client);
            }
            console.log(`Socket ${socket.id} disconnected`);
        },

        ServerLog(socket, data) {
            //var client = this.clients.get(socket.id);
            console.log(`#log>`, data);
        },

        addActor(socket, data) {
            var script = TestUserConfig.scripts.find((script) => {
                return data.script == script.name;
            });
            if (script) {
                script = script.content;
            } else {
                console.log(`Script "${data.script}" not found`);
                return;
            }

            var api = data.api.split('_')[1];
            if (!(api = TestUserConfig.api[api])) {
                console.log(`API "${api}" not found`);
                return;
            }

            socket.room.addActor({
                id     : data.id,
                api,
                script,
                autorun: !!data.autorun
            });

            console.log(`Actor ${data.id} added. API: ${api}, Script: ${data.script}`);
        },

        a(socket, data) {
            var actor = socket.room.actors.get(data.id);
            if (actor) {
                actor.resolve && actor.resolve(data.res);
            } else {
                console.log(`Unity response error: Actor ${data.id} not found`);
            }
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
        console.log('send data', data);
        this.io.to(socketRoom).emit('q', data);
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
