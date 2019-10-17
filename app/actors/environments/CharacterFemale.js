var common = require('./Common');

module.exports = _.extend(common(), {
    async move(data, resolve, reject) {
        console.log("Move to", data);
        resolve(await this.postMessage('move', {
            x: data[0] || 0,
            y: data[1] || 0,
            z: data[2] || 0
        }).catch(reject));
    }
});
