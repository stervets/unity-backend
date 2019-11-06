module.exports = function () {
    return {
        console: {
            log: function (data, resolve) {
                resolve(console.log.apply(console, getParams(data)));
            }
        },

        async getId(data, resolve, reject, interpreter) {
            resolve(await this.postMessage('getId'));
        },

        random(data, resolve, reject, interpreter) {
            if (!data[1]) {
                data[1] = data[0];
                data[0] = 0;
            }
            resolve(Math.random() * (data[1] - data[0]) + data[0]);
        },

        setTimeout(data, resolve, reject, interpreter) {
            setTimeout(resolve, 0, setTimeout(() => {
                runCallback(interpreter, data[0]);
            }, data[1]));
        },

        clearTimeout(data, resolve, reject, interpreter) {
            resolve(clearTimeout(data[0]));
        },

        wait(data, resolve, reject, interpreter) {
            setTimeout(resolve, data[0]);
        }
    }
};
