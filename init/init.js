var fs = require('fs');

require("./jquery-defers.js");
global._                    = require("lodash");
global.Backbone             = require("backbone");
global.BackboneLaunchStatus = {
    INIT        : 0x0,
    PREPARE     : 0x1,
    PREPARE_FAIL: 0x2,
    READY       : 0x4
};

require("./backbone-initialize.js");

Backbone.sync = _.identity;

var destroyFunction              = Backbone.Model.prototype.destroy;
Backbone.Model.prototype.destroy = function (...attrs) {
    this.trigger.apply(this, ['destroy', this, this.collection, ...attrs]);
    destroyFunction.apply(this, attrs);
};

var Radio = require("backbone.radio"),
    radio = {
        channel: {
            app: null
        },
        reset() {
            Radio.reset();
        }
    };

Object.keys(radio.channel).forEach((channel) => {
    radio.channel[channel] = Backbone.Radio.channel(channel);
});

var replacer1 = /\[(["']?)([^\1]+?)\1?\]/g,
    replacer2 = /^\./;

_.extend(global, {
    radio,
    deepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    deep(obj, key, value) {
        if (!obj) {
            return;
        }
        var keys = key.replace(replacer1, '.$2').replace(replacer2, '').split('.'),
            root,
            i    = 0,
            n    = keys.length;
        // Set deep value
        if (arguments.length > 2) {
            root = obj;
            n--;
            while (i < n) {
                key = keys[i++];
                obj = obj[key] = _.isObject(obj[key]) ? obj[key] : {};
            }
            obj[keys[i]] = value;
            value        = root;
            // Get deep value
        } else {
            while ((obj = obj[keys[i++]]) != null && i < n) {
            }
            value = i < n ? void 0 : obj;
        }
        return value;
    },

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
        }
    },

    validateType(type) {
        return ~['object', 'function', 'array'].indexOf(type) ? 'string' : type;
    },

    /*
     Converts object
     {
     a : {
     b1 : { c: 1 },
     b2: 2
     }
     }
     into
     {
     "a.b1.c": 1
     "a.b2": 2
     }
     */

    /*
     levelOptions can be a Number: means max level for flatness (0 is unlimited)

     either it can be an object:
     {
     defaultLevel: 2, // default max level
     levels: {
     'data.pivottable': 0 // unlimited for data.pivottable
     'data.style': 3 // max level 3 for data.style
     },

     disabled: [ // properties that will be excluded from flatten object
     'data.pivottable.conditionalformatting',
     'data.pivottable.manualColumnMove',
     ]
     }
     */
    flattenObject(obj, levelOptions, _level, _concatPath, _overrideMaxLevel) {
        var result   = {}, path, writeResult, realMaxLevel, separator = '.';
        levelOptions = levelOptions || 0;
        _level       = _level || 1;
        if (typeof levelOptions == 'object') {
            _overrideMaxLevel == null && (_overrideMaxLevel = levelOptions.defaultLevel || 0);
            separator = levelOptions.separator || separator;
        }
        _concatPath = _concatPath ? _concatPath + separator : '';
        for (var key in obj) {
            path = _concatPath + key;
            if (!obj.hasOwnProperty(key) || (_overrideMaxLevel != null && levelOptions.disabled && levelOptions.disabled.indexOf(path) >= 0)) continue;
            writeResult = true;

            if (typeof obj[key] == 'object') {
                realMaxLevel = _overrideMaxLevel == null ? levelOptions :
                               (levelOptions.levels && levelOptions.levels[_concatPath + key] != null ? levelOptions.levels[path] : _overrideMaxLevel);
                if (!realMaxLevel || _level < realMaxLevel) {
                    var flatObject = flattenObject(obj[key], levelOptions, _level + 1, path, _overrideMaxLevel == null ? null : realMaxLevel);
                    if (Object.keys(flatObject).length) {
                        for (var resultPath in flatObject) {
                            if (!flatObject.hasOwnProperty(resultPath)) continue;
                            result[key + separator + resultPath] = flatObject[resultPath];
                        }
                    } else {
                        result[key] = deepCopy(obj[key]);
                    }

                    writeResult = false;
                }
            }

            if (writeResult) {
                result[key] = typeof obj[key] == 'object' ? deepCopy(obj[key]) : obj[key];
            }
        }
        return result;
    },

    loadScript(name) {
        return new Promise((resolve, reject) => {
            fs.readFile(`app/actors/scripts/${name}.js`, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    },

    loadScriptSync(name) {
        return fs.readFileSync(`app/actors/scripts/${name}.js`, 'utf8');
    }
});

BackbonePrepare.push(function () {
    this.radio = radio;
});
