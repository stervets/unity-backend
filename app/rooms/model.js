var Clients = require('../clients/collection'),
    Actors  = require('../actors/collection');

module.exports = Backbone.Model.extend({
    clients    : null,
    actors     : null,
    unityClient: null,

    prepare: ['initCollections'],

    defaults: {
        destroyIfEmpty: true
    },

    handlers: {
        'destroy'      : 'onDestroy',
        'actors.add'   : 'onActorAdd',
        'actors.remove': 'onActorRemove'
    },

    addClient(client) {
        var type = client.get('type');
        !this.clients[type] && (this.clients[type] = new Clients()),
            isUnityClient = type == 'unity';

        if (isUnityClient) {
            if (this.unityClient) {
                this.unityClient.socket.disconnect();
                this.unityClient.destroy();
            }
        }

        var addedCliend  = this.clients[type].add(client);
        addedCliend.room = this;

        isUnityClient && (this.unityClient = addedCliend);
    },

    addActor(options, playerId) {
        var actor = this.actors.add(_.extend(options, {}));
        return actor.id;
    },

    onActorAdd(actor) {
        //this.send('unity', 0, )
    },

    onActorRemove() {

    },

    removeClient(client) {
        var destroy = true;
        for (let key in this.clients) {
            if (this.clients[key].length) {
                console.log('FOUND CLIENT', this.clients.toJSON());
                destroy = false;
                break;
            }
        }

        if (destroy) {
            console.log('ROOM DESTROYED');
        }
        destroy && this.destroy();
    },

    onDestroy() {
        for (let key in this.clients) {
            if (this.clients[key].length) {
                while (this.clients[key].length) {
                    this.clients[key].first().destroy();
                }
            }
        }

        while (this.actors.length) {
            this.actors.first().destroy();
        }
    },

    send(clientType, actor, com, vars) {
        return new Promise((resolve) => {
            actor.resolve = resolve;
            this.application.sendRoomQuery(`${this.id}-${clientType}`, actor.id, com, vars);
        });
    },

    initCollections() {
        this.clients = {};
        this.actors  = new Actors([], {
            room: this
        });
    }
});
