const { Worker } = require('worker_threads');

module.exports = Backbone.Model.extend({
    interpreter: null,
    defaults   : {
        script: '',
    },

    handlers: {
        //'destroy': 'onDestroy'
    },

    dataValidators: {},

    workerHandlers: {
        getId() {
            return this.id;
        },

        callback(data, id) {
            this.executeCallback(id, data);
        }
    },

    // commonWorkerHandler({ com, data }) {
    //     return this.room.send('unity', this, com, data);
    // },

    // onDestroy() {
    //     this.room.actors.remove(this);
    // },

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

    request(com, data) {
        return new Promise((resolve) => {
            this.worker.postMessage({ com, data, id: this.setCallback(resolve) });
        });
    },

    post(com, data) {
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
            error.loc && console.log(error.loc);
        } else {
            console.log(errorType, 'FINISHED!!<<<<');
        }
        return error;
    },

    async testRun() {
        var script = await loadScript('CharacterFemale');

        !this.handleError('COMPILE', await this.request('compile', { script })) &&
        (() => {
            setTimeout(() => {
                console.log('PAUSE');
                this.post('pause');
            }, 1000);

            setTimeout(() => {
                console.log('RESUME');
                this.post('resume');
            }, 3000);

            setTimeout(() => {
                console.log('STOP');
                this.post('stop');
            }, 5000);
            return true;
        })() &&
        this.handleError('RUNTIME', await this.request('run'));

        setTimeout(async () => {
            console.log('RUN');
            this.handleError('RUNTIME', await this.request('run'));
        }, 1000);
    },

    launch() {
        this.callbacks = {};
        this.room      = this.collection.room;
        this.worker    = new Worker('./app/actors/worker.js');
        this.worker.on('message', this.onWorkerMessage);

        this.testRun();
    }
});


