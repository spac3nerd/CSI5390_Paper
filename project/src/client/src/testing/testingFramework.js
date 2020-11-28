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



    //"Private" function used internally by this framework
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
    }
};