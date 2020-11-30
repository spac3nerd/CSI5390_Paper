//This is the testing framework for NodeTank
//container - the DOM element
let nodeTankTesting = function(container, socketURL, serverURL) {
    this.containerElement = container;
    this.socketURL = socketURL;
    this.serverURL = serverURL;
    this.registeredTestCases = [];
    this.gameInstances = []; //contains all spawned game instances
    this.tokens = []; //contains list of requested server tokens
};

nodeTankTesting.prototype = {
    registerTest: function(testContainer) {
        this.registeredTestCases.push($("#" + testContainer));
        return this.registeredTestCases.length - 1;
    },
    passTest: function(id) {
        this.registeredTestCases[id][0].children[2].style.visibility = "visible";
    },
    failTest: function(id) {
        this.registeredTestCases[id][0].children[3].style.visibility = "visible";
    },
    resetTests: function() {
        for (let k = 0; k < this.registeredTestCases.length; k++) {
            this.registeredTestCases[k][0].children[2].style.visibility = "hidden";
            this.registeredTestCases[k][0].children[3].style.visibility = "hidden";
        }
    },
    createInstance: function(containerN, playerName) {
        let newSocket = io(this.socketURL);
        let newGame = new game(containerN, newSocket, this.tokens[this.tokens.length - 1], playerName);
        this.gameInstances.push(newGame);

        return newGame;
    },
    getGameInstance: function(id) {
        return this.gameInstances[id];
    },
    requestToken: function(playerName, callback) {
        this.HTTPRequest("POST", "/session/createNewSession",
            {
                playerName: playerName
            }, (response) => {
                this.tokens.push(response.data.token);
                if (callback) {
                    callback(response.data.token);
                }
            });
    },
    assertEquals: function(expected, actual) {
        return expected === actual;
    },
    //kind of pointless, just added for completeness
    assertNotEquals: function(v1, v2) {
        return v1 !== v2;
    },
    assertTrue: function(condition) {
        return condition === true;
    },
    assertFalse: function(condition) {
        return condition === false;
    },
    assertExists: function(variable) {
        return (variable !== null) && (variable !== undefined);
    },
    assertInstanceOf: function(expected, variable) {
        return (variable instanceof expected);
    },

    assertPositionEqual: function(p1, p2) {
        return (p1.x === p2.x) && (p2.z === p2.z);
    },



    //Helper functions
    cloneObj: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    //type - POST/GET/DELETE
    //endPoint - specific endpoint to be called
    //data - outgoing data packet, if applicable
    //callback - callback function to be called on response
    HTTPRequest: function(type, endPoint, data, callback) {
        $.ajax({
            url: this.serverURL + endPoint,
            type: type,
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data)
        }).done(function(data, text, request) {
            if (callback) {
                callback(data);
            }
        });
    },

    setRandomMovement: function(gameInstance){
        //0 - move north, 1 - move south, anything else - none
        let moveNothSouth = Math.floor(Math.random() * Math.floor(3));
        //0 - move east, 1 - move west, anything else - none
        let moveEastWest = Math.floor(Math.random() * Math.floor(3));
        if (moveNothSouth === 0) {
            gameInstance.pressedMovementKey.w = true;
        }
        if (moveNothSouth === 1) {
            gameInstance.pressedMovementKey.s = true;
        }
        if (moveEastWest === 0) {
            gameInstance.pressedMovementKey.d = true;
        }
        if (moveEastWest === 1) {
            gameInstance.pressedMovementKey.a = true;
        }
    },

    stopAllMovement: function(gameInstance) {
        gameInstance.pressedMovementKey.w = false;
        gameInstance.pressedMovementKey.s = false;
        gameInstance.pressedMovementKey.d = false;
        gameInstance.pressedMovementKey.a = false;
    }

};