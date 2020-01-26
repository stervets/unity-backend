global.acorn = require('../../vendor/JS-Interpreter/acorn');
global._     = require("lodash");
var common   = require('./environments/Common');

var Interpreter = null,
    Environment = null;

global.runCallback = (interpreter, callback, ...attrs) => {
    if (!(interpreter && interpreter.stateStack)) {
        console.log("Run callback: NO INTERPRETER!");
    }
    if (!callback) {
        console.log("Run callback: NO CALLBACK!");
        return;
    }

    var params  = JSON.stringify(attrs);
    params      = params.substr(1, params.length - 2);
    var program = acorn.parse(`(function(){})(${params});`);
    _.extend(program, {
        end  : callback.node.end,
        start: callback.node.start,
        scope: callback.parentScope
    });

    _.extend(program.body[0], {
        end  : callback.node.end,
        start: callback.node.start
    });

    _.extend(program.body[0].expression, {
        end   : callback.node.end - 1,
        start : callback.node.start,
        callee: callback.node
    });

    var shouldRun = interpreter.stateStack[0].done;
    interpreter.appendCode(program);
    shouldRun && interpreter.run();
};

/*
 global.runFunction = (interpreter, func, ...attrs) => {
 if (!(interpreter && interpreter.stateStack)) {
 console.log("Run callback: NO INTERPRETER!");
 }
 if (!func) {
 console.log("Run callback: NO CALLBACK!");
 return;
 }

 var params    = JSON.stringify(attrs);
 params        = params.substr(1, params.length - 2);
 var program   = acorn.parse(`${func}(${params});`);
 var shouldRun = interpreter.stateStack[0].done;
 interpreter.appendCode(program);
 shouldRun && interpreter.run();
 };
 */

global.getParams = (data) => {
    return data.map((dataItem) => {
        return Interpreter.pseudoToNative(dataItem);
    });
};

const {
          isMainThread, parentPort, workerData
      }                  = require('worker_threads'),
      JSInterpreter      = require('../../vendor/JS-Interpreter/interpreter'),
      environmentsConfig = require('./environmentsConfig');

if (isMainThread) {
    throw new Error(`WORKER SHOULD NOT BE IN MAIN THREAD: ${__filename}`)
}

var unityResponse = null;

const registerEnvironment = function (environment) {
    return function (interpreter, scope) {
        var register = (environment, scope) => {
            Object.keys(environment).forEach((name) => {
                if (typeof environment[name] == 'object') {
                    interpreter.setProperty(scope, name, interpreter.createObjectProto({}));
                    register(environment[name], scope.properties[name]);
                } else {
                    interpreter.setProperty(scope, name,
                        typeof environment[name] == 'function' ?
                        interpreter.createAsyncFunction(function (...attrs) {
                            const callback = attrs.pop();
                            environment[name].call(Worker, attrs, callback, (message) => {
                                //TODO: Make reject handler (throwException in interpreter?)
                                console.warn('Script execution error:', message);
                            }, interpreter);

                        }) : environment[name]);
                }
            });
        };
        register(environment, scope);
    };
};

var Worker = {
    interpreter: null,
    async postMessage(com, data) {
        return await new Promise((resolve) => {
            unityResponse = (data) => {
                unityResponse = null;
                resolve(data);
            };
            parentPort.postMessage({ com, data });
        });
    },

    response(id, data) {
        parentPort.postMessage({ com: 'callback', data, id });
    },

    onRuntimeError(id) {
        return (e) => {
            this.response(id, {
                message: e.message,
                loc    : e.loc
            });
        };
    },

    onDebug(data) {
        console.log('DEBUG DATA:');
        console.log("place", data.start, ' - ', data.end);
        console.log("I = ", data.scope.i);
    },

    validators: {
        int(param) {
            return parseInt(param) || 0;
        },
        float(param) {
            return parseFloat(param) || 0;
        },
        string(param) {
            return param && param.toString && param.toString() || '';
        },
        bool(param) {
            return !!param;
        }
    },

    com: {
        response(data) {
            unityResponse && unityResponse(data);
        },

        compile(data, id) {
            this.compileData = data;
            var api          = data.api || {};

            api = _.extend(
                api.properties || {},
                Object.keys(api.methods || {}).reduce((res, methodName) => {
                    var params      = api.methods[methodName].params || [];
                    res[methodName] = async (data, resolve, reject) => {
                        resolve(await this.postMessage('q', {
                            com : methodName,
                            vars: params.map((param, index) => {
                                return [
                                    param.type,
                                    this.validators[param.type] ?
                                    this.validators[param.type](data[index]) :
                                    null
                                ];
                            })
                        }).catch(reject));
                    };
                    return res;
                }, {})
            );

            Environment = registerEnvironment(_.extend(common(), api));
            try {
                Interpreter = new JSInterpreter.Interpreter(data.script, Environment);
            } catch (e) {
                this.compileData = false;
                this.response(id, {
                    message: e.message,
                    loc    : e.loc
                });
                return;
            }
            this.response(id);
        },

        start(data, id) {
            this.compileData && (this.com.compile.call(this, this.compileData));
            Interpreter.onRuntimeError = (e) => {
                this.response(id, {
                    message: e.message,
                    loc    : e.loc
                });
            };

            Interpreter.onFinish = () => {
                this.response(id);
            };

            //Interpreter.onDebug = this.onDebug;
            Interpreter.run();
        },

        stop() {
            Interpreter.paused = true;
            Interpreter.onFinish();
            unityResponse && unityResponse();
        },

        pause(data, id) {
            Interpreter.onDebug = (data)=>{
                // console.log('DEBUG DATA:');
                // console.log("place", data.start, ' - ', data.end);
                // console.log("I = ", data.scope.i);
                this.response(id, data.scope);
            };
            //console.log('STOP', Interpreter.paused_);
            Interpreter.paused = true;
        },

        resume() {
            //console.log('RESUME', Interpreter.paused_);
            Interpreter.paused = false;
            Interpreter.run();
        }
    }
};

parentPort.on('message', (data) => {
    if (Worker.com[data.com]) {
        Worker.com[data.com].call(Worker, data.data, data.id);
    } else {
        console.warn(`Worker: Command ${data.com} not found`);
    }
});
