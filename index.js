require("./init/init");
var express = require('express'),
    app     = express();

app.use(express.static(__dirname + "/public"));

app.use("/", (request, response) => {
    response.send("<pre>codify unity backend</pre>");
});

app.listen(8080);

var Application = require("./app/Application");
new Application({
    app,
    port: 3000
});
