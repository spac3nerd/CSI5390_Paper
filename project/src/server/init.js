var gameHostServer = require("./httpServer/server.js"); //we will use an express server to set up the initial communication/serving static files
var server;

var serverOptions = {
    baseURL: global.baseURL,
    httpPort: 8080, //only providing HTTP, security is not a concern for this project
    socketPort: 8081, //port to be used by socket.io
    resources: __dirname + "/../client",
    indexPage: __dirname + "/../client/index.html",
    testPage: __dirname + "/../client/test.html",
    gameOptions: {
        maxPlayers: 4, //max number of concurrent players
        rules: { //define the game type and rules associated with it
            type: "maxPoints",
            maxPoints: 10
        }
    }
};
global.baseURL = "http://localhost" + ":" + serverOptions.httpPort;

function init() {
    server = new gameHostServer(serverOptions);
}

//kick off the game server
init();