var common = require('./Common');

module.exports = _.extend(common(), {
    async moveTo(data, resolve, reject) {
        resolve(await this.postMessage('moveTo', {
            x: data[0] || 0,
            y: data[1] || 0,
            z: data[2] || 0
        }).catch(reject));
    },

    async move(data, resolve, reject) {
        resolve(await this.postMessage('move', {
            dist: (parseInt(data[0]) || 0)
        }).catch(reject));
    },

    async turn(data, resolve, reject) {
        resolve(await this.postMessage('turn', {
            angle: (parseInt(data[0]) || 0) % 4
        }).catch(reject));
    },
});
