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
