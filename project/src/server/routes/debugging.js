let express = require("express");
let router = express.Router();
let globalState = require("../gameCore/global-state");
let gameLoop = require("../gameCore/gameLoop");

router.post("/debug/reset", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    try {
        globalState.setResetServer(true);

        res.end(JSON.stringify({
            success: true,
        }), "utf-8");
    }
    catch {
        res.end(JSON.stringify({
            success: false
        }), "utf-8");
    }
});

router.post("/debug/getGameState", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    try {
        let snapShot = gameLoop.getSnapshotData();

        res.end(JSON.stringify({
            success: true,
            data: snapShot
        }), "utf-8");
    }
    catch {
        res.end(JSON.stringify({
            success: false
        }), "utf-8");
    }

});

router.post("/debug/getMessageLog", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    globalState.setResetServer(true)

});


module.exports = router;