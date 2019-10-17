var Actors = require('../actors/collection');

var id         = 0;
module.exports = Backbone.Model.extend({
    actors  : null,
    prepare : ['initCollections'],
    defaults: {
        isRoot: false
    },

    handlers: {
        'destroy': 'onDestroy'
    },

    initCollections() {
        this.set('id', id++);
        this.room   = this.collection.room;
        this.actors = new Actors([], {
            room  : this.room,
            player: this
        });
    },

    onDestroy() {
        while (this.actors.length) {
            this.actors.first().destroy();
        }
    },

    addActor(options) {
        return this.room.addActor(options, this.id);
    },

    launch() {
    }
});
