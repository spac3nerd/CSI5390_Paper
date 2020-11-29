function gameServer(gameSettings) {
    var bodyParser = require("body-parser");
    var fs = require("fs");
    var express = require("express");
    var http = require("http");
    var globalState = require("../gameCore/global-state");
    var socketManager = require("../gameCore/socket-manager");
    var socketio = require('socket.io'); // should be implemented on top of WebSocket directly for better performance
    var path = require('path');

    globalState.setMaxUsers(gameSettings.gameOptions.maxPlayers);


    var app = express();
    var socketApp = express();
    var socketHTTP = http.Server(socketApp);
    var socket = socketio(socketHTTP);
    socketManager.setSocket(socket);

    //import routes
    var sessionRoutes = require("../routes/session.js");
    var debugRoutes = require("../routes/debugging.js");

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    //allow the use of JSON packets
    app.use(bodyParser.json());
    //static file location
    app.use(express.static(gameSettings.resources));

    //default route
    app.get("/", function(req, res) {
        res.sendFile(path.resolve(gameSettings.indexPage));
    });

    //route for tests
    app.get("/unitTesting", function(req, res) {
        res.sendFile(path.resolve(gameSettings.testPage));
    });

    //map the routes
    app.use(sessionRoutes);
    app.use(debugRoutes);

    var httpServer = http.createServer(app).listen(gameSettings.httpPort);
    console.log("--Game HTTP Server listening on port: " + gameSettings.httpPort);
    var socketServer = socketHTTP.listen(gameSettings.socketPort);
    console.log("--Socket Server listening on port: " + gameSettings.socketPort);
}

module.exports = gameServer;