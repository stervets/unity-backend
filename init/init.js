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

global.radio = radio;

BackbonePrepare.push(function () {
    this.radio = radio;
});

global.deepCopy = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

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
global.flattenObject = function (obj, levelOptions, _level, _concatPath, _overrideMaxLevel) {
    var result   = {}, path, writeResult, realMaxLevel;
    _concatPath  = _concatPath ? _concatPath + '.' : '';
    levelOptions = levelOptions || 0;
    _level       = _level || 1;
    if (typeof levelOptions == 'object' && _overrideMaxLevel == null) {
        _overrideMaxLevel = levelOptions.defaultLevel || 0;
    }
    for (var key in obj) {
        path = _concatPath + key;
        if (!obj.hasOwnProperty(key) || (_overrideMaxLevel != null && levelOptions.disabled && levelOptions.disabled.indexOf(path) >= 0)) continue;
        writeResult = true;

        if (typeof obj[key] == 'object') {
            realMaxLevel = _overrideMaxLevel == null ? levelOptions :
                           (levelOptions.levels[_concatPath + key] != null ? levelOptions.levels[path] : _overrideMaxLevel);
            if (!realMaxLevel || _level < realMaxLevel) {
                var flatObject = flattenObject(obj[key], levelOptions, _level + 1, path, _overrideMaxLevel == null ? null : realMaxLevel);
                if (Object.keys(flatObject).length) {
                    for (var resultPath in flatObject) {
                        if (!flatObject.hasOwnProperty(resultPath)) continue;
                        result[key + '.' + resultPath] = flatObject[resultPath];
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
};

global.loadScript = (name) => {
    return new Promise((resolve, reject) => {
        fs.readFile(`app/actors/scripts/${name}.js`, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
};
