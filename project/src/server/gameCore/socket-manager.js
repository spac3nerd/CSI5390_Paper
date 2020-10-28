let globalState = require("../gameCore/global-state");
let gameLoop = require("./gameLoop");
let three = require("three");

let socket = undefined;
let broadcastChan = undefined;

function setUpEvents() {
    if (socket !== undefined) {
        socket.on("connection", (socket) => {
            broadcastChan = socket;
            console.log("new Connection");
            socket.on("joinGame", (data) => {
                console.log("New Player - " + data.name);
                console.log(globalState.isTokenValid(data.token));
                if (globalState.isTokenValid(data.token)) {
                    globalState.addUser(data.token, data.name);
                    gameLoop.addTank(data.token);
                    //set starting position on server
                    let startingPos = gameLoop.generateSpawnPosition();
                    gameLoop.setInitialPlayerState(data.token, {
                        movement: new three.Vector3(0, 0,0),
                        lookAt: new three.Vector3(0, 0,-50),
                        position: startingPos
                    }, data.name);
                    socket.emit("playerStart", {
                        pos: startingPos,
                        movementVelocity: 45 //units per second
                    });
                }
            });

            socket.on("playerUpdate", (data) => {
                //check if the token is valid
                if (globalState.isTokenValid(data.token)) {
                    gameLoop.updatePlayer(data.token, data.tankState);
                }
            });
            socket.on("shot", (data) => {
                //check if the token is valid
                if (globalState.isTokenValid(data.token)) {
                    gameLoop.shotTaken(data.token, data.lookAt);
                }
            });
        });
    }
}

function broadcast(state) {

    if (broadcastChan !== undefined && globalState.getUserCount() > 0) {
        //we have to both emit and broadcast in order to ensure everyone gets the updates
        broadcastChan.broadcast.emit('tick', state);
        broadcastChan.emit('tick', state);
    }
}


function setSocket(newSocket) {
    socket = newSocket;
    setUpEvents();
}


module.exports = {
    setSocket: setSocket,
    broadcast: broadcast
};