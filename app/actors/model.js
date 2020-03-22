const { Worker } = require('worker_threads');

const config = require('../config/test-config');

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
    },

    state: STATE.STOPPED,

    handlers: {
        'destroy': 'onDestroy'
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
        }
    },

    // commonWorkerHandler({ com, data }) {
    //     return this.room.send('unity', this, com, data);
    // },

    onDestroy() {
        this.script.stop(); //TODO check this is needed
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

    /*
     runScript(script) {
     script != null && (this.script = script);
     this.script = this.script.trim();
     if (this.script) {
     this.postMessage('runScript', {
     script: this.script,
     //environment: {}
     });
     } else {
     console.log('Script is empty');
     }
     },

     compileScript(script) {
     script != null && (this.script = script);
     this.script = this.script.trim();
     if (this.script) {
     this.postMessage('compileScript', {
     script: this.script
     //environment: {}
     });
     } else {
     console.log('Script is empty');
     }
     },
     */

    async onWorkerMessage(data, id) {
        this.workerHandlers[data.com] && this.workerHandlers[data.com].call(this, data.data, data.id);
    },

    handleError(errorType, error) {
        if (error) {
            console.log(`${errorType} ERROR:`, error.message);
            error.location && console.log(error.location);
        } else {
            console.log(errorType, 'COMPLETE');
        }
        return error;
    },

    async testRun() {
        var script = await loadScript('CharacterFemale');

        !this.handleError('COMPILE', await this.requestWorker('compile', {
            script,
            api: config.api.Character
        })) &&
        (() => {
            /*
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
             */
            return true;
        })() &&
        this.handleError('RUNTIME', await this.requestWorker('run'));

        // setTimeout(async () => {
        //     console.log('RUN');
        //     this.handleError('RUNTIME', await this.requestWorker('run'));
        // }, 1000);
    },

    script: {
        async compile() {
            return this.requestWorker('compile', {
                script: this.get('script'),
                api   : this.get('api') //config.api.Character
            });
        },

        start() {
            return this.requestWorker('start');
        },

        stop() {
            this.postWorker('stop');
        },

        pause() {
            return this.requestWorker('pause');
        },

        resume() {
            this.postWorker('resume');
        },

        step() {
            //TODO: make step
        }
    },

    async start() {
        var error = await this.script.compile();
        if (error) {
            return error;
        } else {
            return await this.script.start();
        }
    },

    async startWithLog() {
        console.log(`Run script for actor ${this.get('name')}`);
        var error = this.handleError('COMPILE', await this.script.compile());
        if (error) {
            return error;
        }
        return this.handleError('RUNTIME', await this.script.start());
    },

    scriptStop() {
        if (this.state > STATE.STOPPED) {
            this.script.stop();
        }
        this.state = STATE.STOPPED;
    },

    async scriptRun(doNotRun) {
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
            if ((error = this.handleError('COMPILE', await this.script.compile()))) {
                return error;
            }
            this.state = STATE.COMPILED;
        }

        if (!doNotRun) {
            this.state = STATE.RUNNING;
            error      = this.handleError('RUNTIME', await this.script.start());
        }

        return error;
    },

    async scriptStep() {
        var error;
        if (this.state < STATE.RUNNING) {
            if (error = await this.scriptRun(true)) {
                return error;
            }
        }

        if (this.state < STATE.PAUSED) {
            this.handleError('RUNTIME', this.script.start());
        }else{
            this.script.resume();
        }
        this.script.pause();
        this.state = STATE.PAUSED;
        console.log('PAUSE>>');
        // if (this.state < STATE.RUNNING) {
        //
        // }
    },

    launch() {
        var script  = this.script;
        this.script = {};
        Object.keys(script).forEach((com) => {
            this.script[com] = script[com].bind(this);
        });

        this.callbacks = {};
        this.room      = this.collection.room;
        this.worker    = new Worker('./app/actors/worker.js');
        this.worker.on('message', this.onWorkerMessage);

        if (this.get('autorun')) {
            this.startWithLog();
        }
    }
});


