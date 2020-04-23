require("./init/init");
var Application = require("./app/Application");
new Application({
    port: process.env.SOCKET_PORT || 3000
});
