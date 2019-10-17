module.exports = Backbone.Collection.extend({
    model: require('./model'),
    initialize(models, opts) {
        this.room = opts.room;
        this.player = opts.player;
    }
});
