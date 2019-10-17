require("./init/init");
var express = require('express')();

express.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var Application = require("./app/Application");
new Application({
    express,
    port: 3000
});
