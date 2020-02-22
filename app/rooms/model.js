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

    loadUnityLevel(){
        if (this.config && this.unityClient && this.editorClient){
            this.send('unity', 'loadLevel', this.config.level);
        }
    },

    addClient(client) {
        var type = client.get('type');
        !this.clients[type] && (this.clients[type] = new Clients());

        var addedCliend  = this.clients[type].add(client);
        addedCliend.room = this;

        if (client.isUnityClient()) {
            if (this.unityClient) {
                this.unityClient.socket.disconnect();
                this.unityClient.destroy();
            }
            this.unityClient = addedCliend;
            this.loadUnityLevel();
        }

        if (client.isEditorClient()) {
            if (this.editorClient) {
                this.editorClient.socket.disconnect();
                this.editorClient.destroy();
            }
            this.editorClient = addedCliend;
            this.loadUnityLevel();
        }

        //isUnityClient && (this.unityClient = addedCliend);
        //isEditorClient && (this.editorClient = addedCliend);
    },

    addActor(options) {
        var actor = this.actors.add(options || {});
        return actor.id;
    },

    onActorAdd(actor) {
        //this.send('unity', 0, )
    },

    onActorRemove() {

    },

    onClientDestroy(client) {
        if (client.isEditorClient()){
            this.config = null;
        }

        var destroy = true;
        for (let key in this.clients) {
            if (this.clients[key].length) {
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

    registerConfig(config) {
        this.config = config;
        this.loadUnityLevel();
        console.log(`Config ${config.level} loaded`);
    },

    sendQuery(clientType, actor, com, vars) {
        return new Promise((resolve) => {
            actor.resolve = resolve;
            this.application.sendRoomQuery(`${this.id}-${clientType}`, actor.id, com, vars);
        });
    },

    send(clientType, com, vars){
        this.application.sendRoom(`${this.id}-${clientType}`, com, vars);
    },

    initCollections() {
        this.clients = {};
        this.actors  = new Actors([], {
            room: this
        });
    },

    launch() {
        // this.addActor({
        //     id: 0
        // });
    }
});
