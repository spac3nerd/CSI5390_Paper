let three = require("three");
let socketManager = require("./socket-manager");
let globalState = require("./global-state");
let crypto = require("crypto");

const {Worker,isMainThread,parentPort} = require("worker_threads");

let thrift     = require("thrift");
let aInterface = require("../../centralData/API/RemoteCtrl/nodejs/AgentInterface");
// let ttypes     = require("../../centralData/API/RemoteCtrl/nodejs/jstest_types");
let dataInterface = require("../../centralData/API/Data/nodejs/DataInterface");

let playerTanks = {}; //tracks all player tanks
let shots = {}; //tracks all shots and their owner
let lastUpdate = new Date();
let newMessages = {}; //contains all new messages to be propagated, cleared after each new render

//game rules - should really be a separate config
//note that xmin is defined as being to the left, zMin being at the bottom
//also note, -Z axis points to the top
let bounds = {
    xSpan: 100,
    zSpan: 100,
    xMin: -50,
    xMax: 50,
    zMax: -50,
    zMin: 50
};

let bulletVelocity = 130;
let movementVelocity = 70;


let DataState = {
  'agentToken':  undefined,
  'agentLookat': new three.Vector3(0,0,0),
  'agentMove':   new three.Vector3(0,0,0),
  'goManual':    true,
  'lastImage':   ""
}

//called for each update from clients
//note that the position is only set internally in the server
function updatePlayer(data) {
    //token, packet
    let token = data.token;
    let packet = data.tankState;
    playerTanks[token].lookAt = packet.lookAt;
    playerTanks[token].movement = packet.movement;
    if (data.message) {
        newMessages[token] = data.message;
    }
}

function addTank(token) {
    playerTanks[token] = {};
}

function shotTaken(token, lookAt) {
    //model the object in memory
    let bGeom = new three.Mesh(new three.SphereGeometry(0.5, 32, 32), new three.MeshBasicMaterial({color: 0x000000}));
    bGeom.position.set(playerTanks[token].obj.position.x, playerTanks[token].obj.position.y, playerTanks[token].obj.position.z);
    bGeom.up.set(0, 0, -1);
    //calculate the direction from the player position to the aim point
    let direction = new three.Vector3();
    let aLookAt = new three.Vector3(lookAt.x, lookAt.y, lookAt.z);
    let bLookAt = new three.Vector3(playerTanks[token].obj.position.x, playerTanks[token].obj.position.y, playerTanks[token].obj.position.z);
    direction.subVectors(aLookAt, bLookAt).normalize();

    shots[crypto.randomBytes(32).toString("hex")] = {
        owner: token,
        obj: bGeom,
        direction: direction
    };
}

//returns a random spawn position on the game map
function generateSpawnPosition() {
    let x = Math.floor(Math.random() * (bounds.xSpan - 10)) - (Math.abs(bounds.xMin) - 5);
    let z = Math.floor(Math.random() * (bounds.zSpan - 10)) - (Math.abs(bounds.zMin) - 5);
    let y = 5;

    return new three.Vector3(x, y, z);
}

function checkOutOfBounds() {
    for (let k in playerTanks) {
        if (playerTanks[k].obj.position.x < -47.5 || playerTanks[k].obj.position.x > 47.5 || playerTanks[k].obj.position.z < -47.5 || playerTanks[k].obj.position.z > 47.5) {
            let spawnPos = generateSpawnPosition();
            playerTanks[k].obj.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
            globalState.decrementScore(k);
        }
    }
}

//there are 2 options, 1 - perform collision check with ray casting
// or 2 - since it's 2D, we can just calculate based on X/Z coordinates
//option 2 is much faster than casting a ray for every vertex in an object
function checkHits() {
    for (let k in shots) {
        for (let p in playerTanks) {
            if (shots[k].owner !== p) {
                let sX = shots[k].obj.position.x;
                let sZ = shots[k].obj.position.z;
                if (sX > (playerTanks[p].obj.position.x - 2.5) && sX < (playerTanks[p].obj.position.x + 2.5) && sZ > (playerTanks[p].obj.position.z - 2.5) && sZ < (playerTanks[p].obj.position.z + 2.5)) {

                    let spawnPos = generateSpawnPosition();
                    playerTanks[p].obj.position.set(spawnPos.x, spawnPos.y, spawnPos.z);
                    globalState.incrementScore(shots[k].owner);
                }
            }
        }
    }
}

function setInitialPlayerState(token, state, name) {
    playerTanks[token].lookAt = state.lookAt;
    playerTanks[token].movement = state.movement;
    //playerTanks[token].obj = new three.Object3D();
    //replaced simple 3D obj with mesh to allow for collision check
    playerTanks[token].obj = new three.Mesh(new three.BoxGeometry(5, 5, 5), new three.MeshBasicMaterial({color: 0x57f92a}));
    playerTanks[token].obj.position.set(state.position.x, state.position.y, state.position.z);
    playerTanks[token].obj.up = new three.Vector3(0, 0, -1);
    playerTanks[token].status = "A"; //A - Active, D - Destroyed
    playerTanks[token].name = name;
}

function optimizeBullets() {
    let prunedShots = {};
    for (let k in shots) {
        if (k) {
            //if the bullets is still in bounds
            if (!(shots[k].obj.position.x < bounds.xMin || shots[k].obj.position.x > bounds.xMax || shots[k].obj.position.z < bounds.zMax || shots[k].obj.position.z > bounds.zMin)) {
                prunedShots[k] = shots[k];
            }
        }
    }
    //set the shots to the pruned list
    shots = prunedShots;
}

function loopGame() {
    //check for reset flag
    if (globalState.getResetServer()) {
        console.log("Reset Flag Received");
        playerTanks = {};
        shots = {};
        newMessages = {};
        globalState.resetUserCount();
        globalState.resetScore();
        globalState.setResetServer(false);
        globalState.resetUserTokens();
        return;
    }
    let newTime = new Date();
    let delta = (newTime - lastUpdate) / 1000;
    lastUpdate = newTime;
    let socketManager = require("./socket-manager");

    //create new object current player states
    let newPlayerState = {};
    //go through all players and update the location
    for (let k in playerTanks) {
        if (playerTanks[k].movement !== undefined) {
          let mV = new three.Vector3(playerTanks[k].movement.x, playerTanks[k].movement.y, playerTanks[k].movement.z).normalize(); //normalize this vector to prevent any shenanigans
          if(k===DataState.agentToken && DataState.goManual === false){
            mV = DataState.agentMove;
          }
          playerTanks[k].obj.translateX((mV.x * movementVelocity) * delta);
          playerTanks[k].obj.translateZ((mV.z * movementVelocity) * delta);
            if(k === DataState.agentToken)
            {
              newPlayerState[k] = {
                  position: playerTanks[k].obj.position,
                  lookAt: DataState.agentLookat,
                  name: playerTanks[k].name
              };
            }
            else
            {
              newPlayerState[k] = {
                  position: playerTanks[k].obj.position,
                  lookAt: playerTanks[k].lookAt,
                  name: playerTanks[k].name
              };
            }
        }
    }

    optimizeBullets();

    let newBulletState = {};
    for (let n in shots) {
        shots[n].obj.translateX((shots[n].direction.x * bulletVelocity) * delta);
        shots[n].obj.translateZ((shots[n].direction.z * bulletVelocity) * delta);
        newBulletState[n] = {
            position: shots[n].obj.position,
        };
    }

    checkOutOfBounds();
    checkHits();

    let latestState = {
        players: newPlayerState,
        bullets: newBulletState,
        score: globalState.getScore()
    };

    if (Object.keys(newMessages).length > 0) {
        latestState["messages"] = newMessages;
    }

    socketManager.broadcast(latestState);
    newMessages = {};
    // let now = new Date();
    //
    // console.log(now - newTime);
}

//server-side render loop - 30 times a second - no need to implement any fancy pacing here
setInterval( function() {loopGame()}, 1000 / 30);


//***Debugging functions

function getSnapshotData() {
    let gameState = {
        tanks: {},
        score: null
    };

    for (let k in playerTanks) {
        gameState.tanks[k] = {};
        gameState.tanks[k]["position"] = playerTanks[k].obj.position;
        gameState.tanks[k]["lookAt"] = playerTanks[k].lookAt;
        gameState.tanks[k]["name"] = playerTanks[k].name;
    }
    gameState.score = globalState.getScore();

    return gameState;
}

var GetGameDataFunc = function(json){
  console.log("GetGameData called");
  return "Some other string";
}
var ExecuteTestFunc = function(testNumber){
  console.log("ExecuteTests called");
  let socketManager = require("./socket-manager");
  socketManager.testingCall("RunTest",testNumber);
}
var ExecuteTestsFunc = function(){
  console.log("ExecuteTests called");
  let socketManager = require("./socket-manager");
  socketManager.testingCall("RunAllTests",{});
}
var GetTestResultsFunc = function(){
  console.log("GetTestResults called");
  let socketManager = require("./socket-manager");
  results = socketManager.getLastResults();
  return results;
}
var RestartServerFunc = function(){
  console.log("RestartServer called");
  let gstate = require("./global-state");
  gstate.setResetServer(true);
}
var GetCasesFunc = function(){
  let socketManager = require("./socket-manager");
  socketManager.testingCall("GetTestCases",{});
  return socketManager.getCases();
}

dataServer = thrift.createServer(dataInterface,{
  GetGameData:     GetGameDataFunc,
  ExecuteTests:    ExecuteTestsFunc,
  GetTestResults:  GetTestResultsFunc,
  ExecuteTest:     ExecuteTestFunc,
  RestartServer:   RestartServerFunc,
  GetTestCases:        GetCasesFunc
});

var GetTokenByNameFunc = function(name)
{
  console.log('GetTokenByName called...')
  for (let k in playerTanks)
  {
    if(playerTanks[k].name === name)
    {
      DataState.agentToken = k;
      let socketManager = require("./socket-manager");
      socketManager.flagSource(DataState.agentToken);
      return DataState.agentToken;
    }
  }
  return "[NONE]";
}

var SetLookAtFunc = function(token,point)
{
  DataState.agentLookat = new three.Vector3(point.x,point.y,point.z);
  playerTanks[token].lookAt = DataState.agentLookat;
  updatePlayer(token,playerTanks[token]);
  console.log(point);
  console.log("SetLookat");
}
var FireFunc = function(token)
{
  shotTaken(DataState.agentToken,playerTanks[DataState.agentToken].lookAt);
  console.log("Fire called...");
}

var SetMoveFunc = function(token,x,y,z)
{
  console.log("SetMove called...");
  var movement = new three.Vector3(x,y,z);
  DataState.goManual = false;
  if(x===0.0 && y===0.0 && z===0.0) {
    DataState.goManual=true;
  }
  movement.normalize();
  DataState.agentMove = movement;
  console.log(movement);
}

var GetSceneDataFunc = function(token)
{
  console.log("GetSceneDataFunc called...")
  return "thisissomestring"
}

var GetImageData = function(token){
  if(token === DataState.agentToken){
    let socketManager = require("./socket-manager");
    img = socketManager.getImageData();
    return img;
  }
}

var GetPoseFunc = function(token)
{
  var pos = playerTanks[token].obj.position;
  var lat = playerTanks[token].lookAt;

  var a = new ttypes.Point({x:pos.x,y:pos.y,z:pos.z});
  var b = new ttypes.Point({x:lat.x,y:lat.y,z:lat.z});

  console.log("GetPoseFunc called...");

  return new ttypes.Pose({pos:a,ori:b});
}

var StartDataServerFunc = function(inPort)
{
  if(isMainThread){
      const {Worker2,isMainThread2,parentPort2} = require("worker_threads");
    if(!isMainThread2)
    {
      console.log("data listening");
      console.log(inPort);
      try{
          dataServer.listen(inPort);
          // console.log("Data server has closed.")
      }
      catch(err){
        console.log("Data server error has occurred.");
      }
    }
  }
}

let thriftServer = thrift.createServer(aInterface,{
  SetLookAt:      SetLookAtFunc,
  GetTokenByName: GetTokenByNameFunc,
  GetSceneData:   GetSceneDataFunc,
  SetMove:        SetMoveFunc,
  GetImageData:   GetImageData,
  GetPose:        GetPoseFunc,
  Fire:           FireFunc,
  StartDataServer:StartDataServerFunc
});
if(isMainThread)
{
  console.log("Ctrl listening");
  try{
      thriftServer.listen(9090);
      // console.log("Control server has shut down.")
  }
  catch(err){
    console.log("Control server error has occurred.");
  }
}

module.exports = {
    updatePlayer: updatePlayer,
    addTank: addTank,
    setInitialPlayerState: setInitialPlayerState,
    shotTaken: shotTaken,
    generateSpawnPosition: generateSpawnPosition,
    getSnapshotData: getSnapshotData
};
