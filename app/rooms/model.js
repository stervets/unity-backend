var Clients = require('../clients/collection'),
    Players = require('../players/collection'),
    Actors  = require('../actors/collection'),
    Static  = require('../actors/static/collection');

var id = 0;
module.exports = Backbone.Model.extend({
    clients: null,
    players: null,
    actors : null,

    prepare: ['initCollections'],

    defaults: {
        destroyIfEmpty: true
    },

    handlers: {
        'destroy': 'onDestroy'
    },

    setMaster(client) {
        var type = client.get('type');
        !this.clients[type].master &&
        this.clients[type].clients.length &&
        (this.clients[type].master = this.clients[type].clients.first());
    },

    addClient(client) {
        var type = client.get('type');
        !this.clients[type] && (this.clients[type] = {
            clients: new Clients(),
            master : null
        });
        var addedCliend  = this.clients[type].clients.add(client);
        addedCliend.room = this;
        this.setMaster(client);

        if (this.get('destroyIfEmpty')) {
            var destroy = true;
            for (let key in this.clients) {
                if (this.clients[key].clients.length) {
                    destroy = false;
                    break;
                }
            }
            destroy && this.destroy();
        }
    },

    addPlayer(options) {
        this.players.add(options);
    },

    removeClient(client) {
        var type = client.get('type');
        !this.clients[type].clients.length && (this.clients[type].master = null);
        this.setMaster(client);
    },

    onDestroy() {
        for (let key in this.clients) {
            if (this.clients[key].clients.length) {
                while (this.clients[key].clients.length) {
                    this.clients[key].clients.first().destroy();
                }
            }
        }

        while (this.players.length) {
            this.players.first().destroy();
        }
    },

    send(clientType, actorId, data) {
        return new Promise((resolve)=>{
            this.application.sendRoomQuery(`${this.id}-${clientType}`, actorId, data, ()=>{

            });
        });
    },

    initCollections() {
        this.clients = {};
        this.actors  = new Actors([], {
            room: this
        });
        this.static  = new Static([], {
            room: this
        });
        this.players = new Players([], {
            room: this
        });
    },

    launch(){
        this.addPlayer({
            isRoot: true
        });
    }
});
