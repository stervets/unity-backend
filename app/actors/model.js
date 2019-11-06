const { Worker } = require('worker_threads');

var id         = 0;
module.exports = Backbone.Model.extend({
    interpreter: null,
    defaults   : {
        playerId  : '',
        prefabName: '',
        scriptName: '',

        transform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 }
        },

        state  : null,
        command: null
    },

    handlers: {
        'destroy'          : 'onDestroy',
        'change:scriptName': 'onChangeScriptName'
    },

    dataValidators: {
        create(prefabName, scriptName, x, y, z, angle) {
            return {
                name    : prefabName,
                scriptName,
                position: {
                    x    : x || 0,
                    y    : y || 0,
                    z    : z || 0,
                    angle: angle || 0
                }
            };
        }
    },

    workerHandlers: {
        getId() {
            return this.id;
        },

        async create(params) {
            var result = await this.room.send('unity', this, 'create', params);
            var id     = result &&
                         result.id &&
                         this.player.addActor({
                             id        : result.id,
                             prefabName: params.name,
                             scriptName: params.scriptName,
                             transform : {
                                 position: result.position,
                                 rotation: result.rotation
                             }
                         }) || null;
            return id;
        }
    },

    commonWorkerHandler({ com, data }) {
        return this.room.send('unity', this, com, data);
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
        this.player = this.collection.player;
        this.worker = new Worker('./app/actors/worker.js');
        this.worker.on('message', this.onWorkerMessage);
        this.room.actors.add(this);
        this.onChangeScriptName();
    }
});


