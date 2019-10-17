var common = require('./Common');

module.exports = _.extend(common(), {
    async create(data, resolve, reject) {
        resolve(await this.postMessage('create', getParams(data)).catch(reject));
    }
});
