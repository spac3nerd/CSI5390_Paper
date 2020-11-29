var express = require("express");
var router = express.Router();
var globalState = require("../gameCore/global-state");
var crypto = require("crypto");

//keeps an array of objects associated a token to a player name
//the token exists to ensure that only approved socket requests will be allowed through
var validTokens = {};

router.get("/session/getActivePlayers", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(JSON.stringify({
        success: true,
        data: {
            count: globalState.getUserCount()
        }
    }), "utf-8");
});

router.post("/server/reset", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    debugger;
    globalState.setResetServer(true)
});


//This route tells the client whether they can enter the game, if so an unique token is returned
//which is used by the client to set up the socket
router.post("/session/createNewSession", function(req, res) {
    validTokens = globalState.getUserTokens();
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });

    //set name to the empty string if name was not passed
    var playerName = req.body.playerName === undefined ? "" : req.body.playerName;

    if (globalState.spaceAvailable() && playerName !== "") {
        var token = crypto.randomBytes(64).toString("hex");
        validTokens[token] = playerName;
        syncTokenStates();
        res.end(JSON.stringify({
            success: true,
            data: {
                token: token //create an unique token that we can reference when the socket is created
            }
        }), "utf-8");
    }
    else {
        res.end(JSON.stringify({
            success: false,
            message: "Max Number of Players Reached!"
        }), "utf-8");
    }
});

function syncTokenStates() {
    globalState.setUserTokens(validTokens);
}

module.exports = router;