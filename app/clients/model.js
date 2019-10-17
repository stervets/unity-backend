module.exports = Backbone.Model.extend({
    defaults: {
        type: ''
    },

    handlers: {
        'destroy': 'onDestroy'
    },

    onDestroy() {
        radio.channel.app.trigger('destroy:client', this);
    },

    send(com, vars) {
        return this.room.application.sendClientQuery(this, com, vars);
    },

    async syncUnityClient() {
        await this.send('create', this.room.static.toJSON());
        await this.send('create', this.room.actors.toJSON());
        this.send('run');
    },

    start() {
        this.get('type') == 'unity' && this.syncUnityClient();
    }
});
