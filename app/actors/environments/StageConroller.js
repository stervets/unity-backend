var common = require('./Common');

module.exports = _.extend(common(), {
    async create(data, resolve, reject) {
        var result = await this.postMessage('create', getParams(data)).catch(reject);
        resolve(result);
    },


    async createStatic(data, resolve, reject) {
        var result = await this.postMessage('createStatic', getParams(data)).catch(reject);
        resolve(result);
    }
});
