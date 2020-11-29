var express = require("express");
var router = express.Router();
var globalState = require("../gameCore/global-state");

router.post("/debug/reset", function(req, res) {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    globalState.setResetServer(true)

    res.end(JSON.stringify({
        success: true,
    }), "utf-8");
});

module.exports = router;