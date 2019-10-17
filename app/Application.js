var Clients = require('./clients/collection'),
    Rooms   = require('./rooms/collection');

module.exports = Backbone.Model.extend({
    rooms  : null,
    prepare: ['initCollections'],

    handlers: {
        'radio.channel.app.destroy:client': 'onDestroyClient'
    },

    roomCallbacks: {},

    socketHandlers: {
        RegisterClient(socket, client) {
            var room,
                roomId = client.room || 'default';

            if (!(room = this.rooms.get(roomId))) {
                room             = this.rooms.add({
                    id: roomId
                });
                room.application = this;
            }

            var clientModel        = new Clients.prototype.model({
                id  : socket.id,
                type: client.type
            });
            clientModel.room       = room;
            clientModel.socket     = socket;
            clientModel.socketRoom = `${roomId}-${client.type}`;
            room.addClient(clientModel);
            this.clients.add(clientModel);
            socket.join(roomId);
            socket.join(clientModel.socketRoom);

            clientModel.start();

            /*
             this.sendQuery(clientModel, 0, 'create', {
             name : 'ScriptDrivenCharacterFemale',
             grid : {
             x: 5
             },
             angle: 90
             });
             */
        },

        disconnect(socket) {
            var client = this.clients.get(socket.id);
            if (client) {
                client.destroy();
                client.room.removeClient(client);
                //this.clients.remove(client);
            }
            console.log(`Socket ${socket.id} disconnected`);
        },

        ServerLog(socket, data) {
            var client = this.clients.get(socket.id);
            console.log(`${client.socketRoom} (${client.id})`, data);
        },

        a(socket, data) {
            if (data.id) {
                console.log("response", data);
            } else {
                var client = this.clients.get(socket.id);
                client && client.resolve && client.resolve(data.res);
            }
        }
    },

    onDestroyClient(client) {
        this.clients.remove(client);
    },

    sendClientQuery(client, com, vars) {
        return new Promise((resolve) => {
            client.resolve = resolve;
            client.socket.emit('q', { id: 0, com, vars });
        });
    },

    sendRoomQuery(socketRoom, actorId, { com, vars }, callback) {
        this.roomCallbacks[`${socketRoom}-${actorId}`] = callback;
        this.io.to(socketRoom).emit('q', {
            id: actorId,
            com,
            vars
        });
    },

    /*
     sync(client, actorId, com, vars) {
     this.io.to(client.socketRoom).emit('s', {
     id: actorId,
     com,
     vars
     });
     },

     */

    initCollections() {
        this.rooms   = new Rooms();
        this.clients = new Clients();

        var room         = this.rooms.add({
            id: 'default'
        });
        room.application = this;
    },

    onConnection(socket) {
        console.log(`Socket ${socket.id} connected`);
        Object.keys(this.socketHandlers).forEach((handlerName) => {
            socket.on(handlerName, (...attrs) => {
                this.socketHandlers[handlerName].call(this, socket, ...attrs);
            });
        });
        socket.emit("Handshake");
    },

    launch(opts) {
        this.queries = {};
        var http     = require('http').createServer(opts.express);
        this.io      = require('socket.io')(http);

        this.io.on('connection', this.onConnection);

        http.listen(opts.port, () => {
            console.log(`listening on *:${opts.port}`);
        });
    }
});
