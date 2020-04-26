global.acorn             = require('../../vendor/JS-Interpreter/acorn');
global._                 = require("lodash");
var common               = require('./environments/Common');
const {
          isMainThread, parentPort, workerData
      }                  = require('worker_threads'),
      JSInterpreter      = require('../../vendor/JS-Interpreter/interpreter'),
      environmentsConfig = require('./environmentsConfig');

if (isMainThread) {
    throw new Error(`WORKER SHOULD NOT BE IN MAIN THREAD: ${__filename}`)
}

global.Interpreter = null;
var Environment    = null;

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
        end        : callback.node.end,
        start      : callback.node.start,
        parentScope: callback.parentScope
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

    interpreter.appendCode(program, callback.parentScope);
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

var unityResponse = null;

/*
var inspector = require('inspector');
inspector.open('10220', null, true);

 */

var _interpreterInstance;
const registerEnvironment = function (environment) {
    return function (interpreter, scope) {
        var register = (environment, scope) => {
            Object.keys(environment).forEach((name) => {
                if (typeof environment[name] == 'object') {
                    interpreter.setProperty(scope, name, interpreter.createObjectProto({}));
                    register(environment[name], scope.properties[name]);
                } else {
                    if (typeof environment[name] == 'function') {
                        interpreter.setProperty(scope, name,
                            interpreter.createAsyncFunction(function (...attrs) {
                                const callback = attrs.pop();
                                environment[name].call(Worker, attrs, callback, (message) => {
                                    //TODO: Make reject handler (throwException in interpreter?)
                                    console.warn('Script execution error:', message);
                                }, interpreter);
                            }));
                    } else {
                        if (typeof environment[name] == 'string') {
                            if (!environment[name].indexOf('getter:')) {
                                let getter = environment[name].slice(7);
                                interpreter.setProperty(scope, name, JSInterpreter.Interpreter.VALUE_IN_DESCRIPTOR, {
                                    get: interpreter.createAsyncFunction(async function (...attrs) {
                                        const callback = attrs.pop();
                                        callback(await Worker.postMessage('q', {
                                            com : getter,
                                            vars: []
                                        }).catch(() => {
                                            callback();
                                        }));
                                    })
                                });
                            } else {
                                interpreter.setProperty(scope, name, environment[name]);
                            }
                        } else {
                            interpreter.setProperty(scope, name, environment[name]);
                        }
                    }
                }
            });
        };
        register(environment, scope);
    };
};
var restrictedProperties  = [
    'NaN', 'Infinity', 'undefined',
    'window', 'this', 'self',
    'Function', 'Object', 'Array',
    'String', 'Boolean', 'Number',
    'Date', 'RegExp', 'Error',
    'EvalError', 'RangeError', 'ReferenceError',
    'SyntaxError', 'TypeError', 'URIError',
    'Math', 'JSON', 'eval',
    'parseInt', 'parseFloat', 'isNaN',
    'isFinite', 'console'
];

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

    post(com, data) {
        parentPort.postMessage({ com, data });
    },

    response(id, data) {
        parentPort.postMessage({ com: 'callback', data, id });
    },

    addEventListener(name, callback) {
        if (callback && callback.class == 'Function') {
            this.eventListeners[name] = this.eventListeners[name] || [];
            this.eventListeners[name].push(callback);
        }
    },

    removeEventListener(name, callback) {
        if (callback && this.eventListeners[name]) {
            this.eventListeners[name] = this.eventListeners[name].filter((listener) => {
                return callback != listener;
            });
        } else {
            this.eventListeners[name] = [];
        }
    },

    eventListeners: {},
    callbacks     : {},

    validators: {
        int(param, defaultValue) {
            return (param == null && defaultValue != null ? parseInt(defaultValue) : parseInt(param)) || 0;
        },
        float(param, defaultValue) {
            return (param == null && defaultValue != null ? parseFloat(defaultValue) : parseFloat(param)) || 0;
        },
        string(param, defaultValue) {
            return (param == null && defaultValue != null ?
                    defaultValue && defaultValue.toString && defaultValue.toString() :
                    param && param.toString && param.toString()) || '';
        },
        bool(param, defaultValue) {
            return param == null && defaultValue != null ? !!defaultValue : !!param;
        },
        object(param, defaultValue) {
            param == null && (param = defaultValue);
            try {
                typeof param == 'string' && (param = JSON.parse(param));
                param = JSON.stringify(param);
            } catch (e) {
                param = "{}";
            }
            return param;
        },
        function(param, defaultValue) {
            param == null && (param = defaultValue || null);
            if (param != null && param.class == 'Function') {
                let id;
                while (this.callbacks[(id = Math.random())]) {
                }
                this.callbacks[id] = param;
                return id.toString();
            }
            return '';
        }
    },

    com: {
        response(data) {
            unityResponse && unityResponse(data);
        },

        compile(data, id) {
            var api = data.api || {};

            api = _.extend(
                api.properties || {},
                Object.keys(api.methods || {}).reduce((res, methodName) => {
                    var params      = api.methods[methodName].params || [];
                    res[methodName] = async (data, resolve, reject) => {
                        resolve(await this.postMessage('q', {
                            com : methodName,
                            vars: params.map((param, index) => {
                                return [
                                    param.type == 'object' || param.type == 'function' ? 'string' : param.type,
                                    this.validators[param.type] ?
                                    this.validators[param.type].call(this, data[index], param.default) :
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
                _interpreterInstance = Interpreter = new JSInterpreter.Interpreter(data.script, Environment);
            } catch (e) {
                //this.compileData = false;
                this.response(id, {
                    message : e.message,
                    location: e.loc
                });
                return;
            }
            this.response(id);
        },

        run(data, id) {
            //this.compileData && (this.com.compile.call(this, this.compileData));
            Interpreter.onRuntimeError = (e) => {
                this.response(id, {
                    message : e.message,
                    location: e.loc
                });
                unityResponse && unityResponse();
            };

            Interpreter.onFireDebugger = () => {
                this.post('fireDebugger');
            };

            Interpreter.onFinish = () => {
                Interpreter.onFinish       = null;
                Interpreter.onFireDebugger = null;
                this.response(id);
            };

            Interpreter.isRunning = true;
            data.run && this.com.resume.call(this);
        },

        stop() {
            if (Interpreter.isRunning) {
                this.callbacks        = {};
                this.eventListeners   = {};
                Interpreter.paused_   = true;
                Interpreter.isRunning = false;
                Interpreter.onFinish && Interpreter.onFinish();
                unityResponse && unityResponse();
            }
        },

        step(data, id) {
            Interpreter.onDebug = (data) => {
                // console.log('DEBUG DATA:');
                // console.log("place", data.start, ' - ', data.end);
                //console.log("I = ", data.scope.i, '->', data.scope.asd);
                data && (data.scope = Object.keys(data.scope).reduce((res, key) => {
                    var value = data.scope[key];
                    if (!~restrictedProperties.indexOf(key) &&
                        typeof value != 'function' && typeof value != 'undefined') {
                        if (value == null || value.toString() != '[object Function]') {
                            res[key] = Interpreter.pseudoToNative(value);
                        }
                    }
                    return res;
                }, {}));

                this.response(id, data);
            };

            if (Interpreter.paused_) {
                Interpreter.run();
            }
            Interpreter.paused_ = true;
        },

        resume() {
            Interpreter.paused_ = false;
            Interpreter.run();
        },

        runCallbackInAsyncFunction(data) {
            if (this.callbacks[data.callback]) {
                data.res = Array.isArray(data.res) ? data.res : [data.res];
                runCallback(Interpreter, this.callbacks[data.callback], ...data.res);
                delete this.callbacks[data.callback];
            }
        },

        fireEvent(data) {
            data.data = Array.isArray(data.data) ? data.data : [data.data];
            this.eventListeners[data.event] &&
            this.eventListeners[data.event].forEach((listener) => {
                runCallback(Interpreter, listener, ...data.data);
            });
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
