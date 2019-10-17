module.exports = function () {
    return {
        console: {
            log: function (data, resolve) {
                resolve(console.log.apply(console, getParams(data)));
            }
        },

        setTimeout(data, resolve, reject, interpreter) {
            setTimeout(resolve, 0, setTimeout(() => {
                runCallback(interpreter, data[0]);
            }, data[1]));
        },

        clearTimeout(data, resolve, reject, interpreter) {
            resolve(clearTimeout(data[0]));
        }
    }
};
