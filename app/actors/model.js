const { Worker } = require('worker_threads');

var id         = 0;
module.exports = Backbone.Model.extend({
    interpreter: null,
    defaults   : {
        scriptName: '',
        script    : '',

        transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },

        state  : null,
        command: null
    },

    handlers: {
        'destroy'          : 'onDestroy'
    },

    dataValidators: {
    },

    workerHandlers: {
        getId() {
            return this.id;
        }
    },

    commonWorkerHandler({ com, data }) {
        return this.room.send('unity', this, com, data);
    },

    onDestroy() {
        this.room.actors.remove(this);
    },

    postMessage(com, data) {
        this.worker.postMessage({ com, data });
    },

    runScript(script) {
        script != null  && (this.script = script);
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
        var validatedData = this.dataValidators[data.com] ?
                            this.dataValidators[data.com].apply(this, data.data) : data.data;

        this.set('command', {
            com : data.com,
            data: validatedData
        });

        var response = this.workerHandlers[data.com] ?
                       await this.workerHandlers[data.com].apply(this, Array.isArray(validatedData) ? validatedData : [validatedData]) :
                       await this.commonWorkerHandler.call(this, data);
        this.set('command', null);
        this.postMessage('response', response);
    },

    launch() {
        !this.get('id') && this.set('id', ++id);
        this.room   = this.collection.room;
        this.worker = new Worker('./app/actors/worker.js');
        this.worker.on('message', this.onWorkerMessage);
        this.room.actors.add(this);
    }
});


