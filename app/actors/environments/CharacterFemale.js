var common = require('./Common');

module.exports = _.extend(common(), {
    async move(data, resolve, reject) {
        resolve(await this.postMessage('move', {
            x: data[0] || 0,
            y: data[1] || 0,
            z: data[2] || 0
        }).catch(reject));
    },

    async turn(data, resolve, reject) {
        resolve(await this.postMessage('turn', {
            angle: data[0] || 0
        }).catch(reject));
    },
});
