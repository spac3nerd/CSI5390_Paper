let globalState = require("../gameCore/global-state");
let gameLoop = require("./gameLoop");
let three = require("three");

let socket = undefined;
let broadcastChan = undefined;

let imageData = "";
let lastTestCheck = "";
let resultsArrived = false;
let testCasesString = ""

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
                else {
                    console.log(globalState.isTokenValid(data.token));
                }
            });

            socket.on("playerUpdate", (data) => {
                //check if the token is valid
                if (globalState.isTokenValid(data.token)) {
                    gameLoop.updatePlayer(data);
                }
            });
            socket.on("shot", (data) => {
                //check if the token is valid
                if (globalState.isTokenValid(data.token)) {
                    gameLoop.shotTaken(data.token, data.lookAt);
                }
            });

            //Cale - screenshot is received here
            socket.on("screenShotSent", (data) => {
                imageData = data;
            });

            socket.on("TestResults",(data)=>{
              lastTestCheck = data;
            });

            socket.on("TestCases",(data)=>{
              console.log("TestCasses called");
              testCasesString = data;
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

// Flag user with given token as source of image data:
function flagDataSource(userToken) {
  if (broadcastChan !== undefined && globalState.getUserCount() > 0){
    broadcastChan.broadcast.emit("flagSource",userToken);
    broadcastChan.emit("flagSource",userToken);
  }
}

// Return last received image data:
function getImageData(){
  return imageData;
}

function TestingCall(eventName,args){
  socket.emit(eventName,args);
}

function GetCases(){
  return testCasesString;
}

function GetLastResults(){
  socket.emit("GetResults");
  result = lastTestCheck;
  lastTestCheck = "";
  return result;
}

module.exports = {
    setSocket: setSocket,
    broadcast: broadcast,
    flagSource: flagDataSource,
    getImageData: getImageData,
    testingCall: TestingCall,
    getLastResults: GetLastResults,
    getCases: GetCases
};
