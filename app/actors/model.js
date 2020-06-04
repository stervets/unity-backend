const { Worker } = require('worker_threads');

const STATE = {
    STOPPED : 0,
    COMPILED: 1,
    RUNNING : 2,
    PAUSED  : 3
};

module.exports = Backbone.Model.extend({
    defaults: {
        name      : '',
        scriptName: '',
        script    : '',
        api       : null,
        apiName   : '',
        metadata  : ''
    },

    state: STATE.STOPPED,

    handlers: {
        'destroy'          : 'onDestroy',
        'change:scriptName': 'onChangeScriptName'
    },

    dataValidators: {},

    workerHandlers: {
        getId() {
            return this.id;
        },

        callback(data, id) {
            this.executeCallback(id, data);
        },

        async q(data) {
            this.postWorker('response', await this.room.sendQuery('unity', this, data.com, data.vars));
        },

        log(data) {
            this.room.sendEvent('editor', 'log', {
                id  : this.id,
                type: data.type,
                data: data.params
            });
        },

        fireDebugger() {
            this.scriptStep();
        }
    },

    // commonWorkerHandler({ com, data }) {
    //     return this.room.send('unity', this, com, data);
    // },

    runCallbackInAsyncFunction(callback, res) {
        this.postWorker('runCallbackInAsyncFunction', {
            callback,
            res
        });
    },

    fireEvent(event, data) {
        if (this.state >= STATE.RUNNING) {
            this.postWorker('fireEvent', {
                event,
                data
            });
        }
    },

    onDestroy() {
        this.room.sendEvent('editor', 'removeActor', {
            id      : this.id,
            metadata: this.room.metadata[this.get('apiName')]
        });
        //this.script.stop();
        this.worker.terminate();
    },

    executeCallback(id, data) {
        if (this.callbacks[id]) {
            this.callbacks[id](data);
            delete this.callbacks[id];
        }
    },

    setCallback(resolve) {
        var callbackId;
        while (this.callbacks[(callbackId = Math.random())]) {
        }
        this.callbacks[callbackId] = resolve;
        return callbackId;
    },

    requestWorker(com, data) {
        return new Promise((resolve) => {
            this.worker.postMessage({ com, data, id: this.setCallback(resolve) });
        });
    },

    postWorker(com, data) {
        this.worker.postMessage({ com, data });
    },

    async onWorkerMessage(data) {
        this.workerHandlers[data.com] && this.workerHandlers[data.com].call(this, data.data, data.id);
    },

    handleError(errorType, error) {
        if (error) {
            console.log(`${errorType} ERROR:`, error.message);
            error.location && console.log(error.location);
            this.room.sendEvent('editor', 'setState', {
                id      : this.id,
                state   : STATE.STOPPED,
                metadata: this.room.metadata[this.get('apiName')]
            });

            this.room.sendEvent('editor', 'log', {
                id      : this.id,
                type    : 2,
                location: error.location,
                data    : [`${errorType} ERROR:`, error.message],
                metadata: this.room.metadata[this.get('apiName')]
            });
        } else {
            console.log(errorType, 'COMPLETE');
        }
        return error;
    },

    /*
     async testRun() {
     var script = await loadScript('CharacterFemale');

     !this.handleError('COMPILE', await this.requestWorker('compile', {
     script,
     //api: config.api.Character
     })) &&
     (() => {

     setTimeout(() => {
     console.log('PAUSE');
     this.postWorker('pause');
     }, 1000);

     setTimeout(() => {
     console.log('RESUME');
     this.postWorker('resume');
     }, 3000);

     setTimeout(() => {
     console.log('STOP');
     this.postWorker('stop');
     }, 5000);

     return true;
     })() &&
     this.handleError('RUNTIME', await this.requestWorker('run'));

     // setTimeout(async () => {
     //     console.log('RUN');
     //     this.handleError('RUNTIME', await this.requestWorker('run'));
     // }, 1000);
     },
     */

    script: {
        async compile(script) {
            !script && (script = this.linkedScript && this.linkedScript.content || this.get('script') || '');
            return this.requestWorker('compile', {
                script,
                api: this.get('api')
            });
        },

        run(doNotRun) {
            this.room.sendEvent('editor', 'setState', {
                id      : this.id,
                state   : STATE.RUNNING,
                metadata: this.room.metadata[this.get('apiName')]
            });

            return this.requestWorker('run', {
                run: !doNotRun
            });
        },

        stop() {
            this.room.sendEvent('editor', 'setState', {
                id      : this.id,
                state   : STATE.STOPPED,
                metadata: this.room.metadata[this.get('apiName')]
            });

            this.postWorker('stop');
        },

        resume() {
            this.room.sendEvent('editor', 'setState', {
                id      : this.id,
                state   : STATE.RUNNING,
                metadata: this.room.metadata[this.get('apiName')]
            });

            this.postWorker('resume');
        },

        step() {
            this.room.sendEvent('editor', 'setState', {
                id      : this.id,
                state   : STATE.PAUSED,
                metadata: this.room.metadata[this.get('apiName')]
            });

            return this.requestWorker('step');
        }
    },

    /*
     async start() {
     var error = await this.script.compile();
     if (error) {
     return error;
     } else {
     return await this.script.start();
     }
     },
     /*
     async startWithLog() {
     console.log(`Run script for actor ${this.get('name')}`);
     var error = this.handleError('COMPILE', await this.script.compile());
     if (error) {
     return error;
     }
     return this.handleError('RUNTIME', await this.script.start());
     },
     */

    scriptStop() {
        if (this.state > STATE.STOPPED) {
            this.script.stop();
        }
        this.state = STATE.STOPPED;
    },

    async scriptRun(script, doNotRun) {
        script && typeof script == 'object' && (script = script[this.get('scriptName')]);

        var error = null;
        if (this.state > STATE.RUNNING) {
            this.state = STATE.RUNNING;
            this.script.resume();
            return error;
        }

        if (this.state > STATE.STOPPED) {
            this.scriptStop();
        }

        if (this.state < STATE.COMPILED) {
            if ((error = this.handleError('COMPILE', await this.script.compile(script)))) {
                return error;
            }
            this.state = STATE.COMPILED;
        }

        this.state = STATE.RUNNING;
        if (doNotRun) {
            this.script.run(true).then((error) => {
                this.handleError('RUNTIME', error);
            });
            return null;
        } else {
            error = this.handleError('RUNTIME', await this.script.run(doNotRun));
        }
        return error;
    },

    async scriptStep(script) {
        if (this.isScriptStepLocked) {
            return false;
        }
        this.isScriptStepLocked = true;

        if (this.state < STATE.RUNNING) {
            if (await this.scriptRun(script, true)) {
                return false;
            }
        }

        this.state = STATE.PAUSED;
        (async () => {
            var debugData = await this.script.step();
            debugData && console.log(`${debugData.loc.line}:${debugData.loc.column} >`, debugData.scope);

            this.room.sendEvent('editor', 'debugData', {
                id  : this.id,
                data: {
                    start : debugData.start,
                    end   : debugData.end,
                    line  : debugData.loc && debugData.loc.line,
                    column: debugData.loc && debugData.loc.column,
                    scope : debugData.scope
                }
            });
            this.isScriptStepLocked = false;
        })();

        return true;
    },

    onChangeScriptName() {
        var scriptName = (this.get('scriptName') || '').trim();
        if ((this.linkedScript = !!scriptName)) {
            this.linkedScript = this.room.config.scripts[scriptName];
        }
    },

    launch() {
        var script  = this.script;
        this.script = {};
        Object.keys(script).forEach((com) => {
            this.script[com] = script[com].bind(this);
        });

        this.callbacks = {};
        this.room      = this.collection.room;
        this.onChangeScriptName();
        this.worker = new Worker('./app/actors/worker.js');
        this.worker.on('message', this.onWorkerMessage);

        var json = this.toJSON();
        delete json.api;

        var metadata = this.get('metadata') || '';
        try {
            metadata = JSON.parse(metadata);
        } catch (e) {
            metadata = {};
        }
        typeof metadata !== 'object' && (metadata = {});

        this.room.sendEvent('editor', 'addActor', _.extend(json,
            {
                metadata: _.extend(this.room.metadata[this.get('apiName')] || {}, metadata)
            }));
        this.room.isLevelRunning && this.scriptRun();
        //this.get('autorun') && this.scriptRun();
    }
});
