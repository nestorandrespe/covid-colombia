const express = require('express');
const server = express();
const port = 4000;
var fs = require('fs');

server.use(express.static('public'));

server.get("/", (req, res) => {
    res.sendFile(__dirname + '/index copy.html');
});

server.get("/usa", (req, res) => {
    res.sendFile(__dirname + '/usa.html');
});

server.listen(port, () => {
    console.log(`Server listening at ${port}`);
});