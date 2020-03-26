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

    // send(com, vars) {
    //     return this.room.application.sendClientQuery(this, com, vars);
    // },

    isUnityClient() {
        return this.attributes.type == 'unity';
    },

    isEditorClient() {
        return this.attributes.type == 'editor';
    },

    async syncUnityClient() {
        //await this.send('createStatic', this.room.static.toJSON());
        //console.log('SYNC', JSON.stringify(this.room.actors.toJSON(), null, 4));
        //await this.send('create', this.room.actors.toJSON());
        //await this.send('run');
    },

    async syncEditorClient() {
        //await this.send('scripts', this.room.actors.toJSON());
    }
});
