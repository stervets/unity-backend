const { Worker } = require('worker_threads');

var id         = 0;
module.exports = Backbone.Model.extend({
    interpreter: null,
    defaults   : {
        playerId  : '',
        prefabName: '',
        scriptName: '',

        position: { x: 0, y: 0, z: 0 },
        angle   : 0
    },

    handlers: {
        'destroy'          : 'onDestroy',
        'change:scriptName': 'onChangeScriptName'
    },

    workerHandlers: {
        create(prefabName, scriptName, position) {
            this.player.addActor({
                prefabName, scriptName,
                angle   : position.angle,
                position: {
                    x: position.x,
                    y: position.y,
                    z: position.z,
                }
            });
        }
    },

    onDestroy() {
        this.room.actors.remove(this);
    },

    async onChangeScriptName() {
        this.script = await loadScript(this.get('scriptName'));
        this.player.get('isRoot') && this.runScript();
    },

    postMessage(com, data) {
        this.worker.postMessage({ com, data });
    },

    runScript() {
        this.script = this.script.trim();
        if (this.script) {
            this.postMessage('runScript', {
                script     : this.script,
                environment: this.get('prefabName')
            });
        } else {
            console.log('Script is empty');
        }
    },

    async onWorkerMessage(data) {
        this.postMessage('response', this.workerHandlers[data.com] ? await this.workerHandlers[data.com].apply(this, data.data) : null);
    },

    launch() {
        this.set('id', ++id);
        this.room   = this.collection.room;
        this.player = this.collection.player;
        this.worker = new Worker('./app/actors/worker.js');
        this.worker.on('message', this.onWorkerMessage);
        this.room.actors.add(this);
        this.onChangeScriptName();
    }
});


