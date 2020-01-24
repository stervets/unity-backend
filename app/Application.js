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
            console.log(`Client "${this.get('type')}" in room ${room.id} started`);
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

        /*
         RunScript(socket, data){
         var client = this.clients.get(socket.id);
         if (client){
         var actor = client.room.actors.get(data.id);
         if (actor) {
         actor.runScript(data.data);
         }
         }
         },

         a(socket, data) {
         var client = this.clients.get(socket.id);
         if (data.id && client) {
         if (client.room.clients[client.get('type')].master == client) {
         var actor = client.room.actors.get(data.id);
         //console.log('ACTOR', actor);
         if (actor) {
         data.transform && actor.set('transform', data.transform);
         data.state && actor.set('state', data.state);
         actor.resolve && actor.resolve(data.res);
         }
         }
         } else {
         client && client.resolve && client.resolve(data.res);
         }
         }

         */
    },

    /*
     sendClientQuery(client, com, vars) {
     return new Promise((resolve) => {
     client.resolve = resolve;
     client.socket.emit('q', { id: 0, com, vars });
     });
     },

     sendRoomQuery(socketRoom, actorId, com, vars, callback) {
     var data = {
     id: actorId,
     com,
     vars
     };
     this.io.to(socketRoom).emit('q', data);
     //this.roomCallbacks[`${socketRoom}-${actorId}`] = { ...data, callback };
     },

     */

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
