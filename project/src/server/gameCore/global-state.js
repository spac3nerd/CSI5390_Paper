let currentUsers = 0;
let maxUsers = 4;
let userTokens = {};
let score = {};
let resetServer = false;

function addUser(token, name) {
    currentUsers += 1;
    //score needs to have an association with a token, not just the player's name
    score[token] = {
        name: name,
        score: 0
    };
}

function getScore() {
    return score;
}

function resetScore() {
    score = {};
    currentUsers = 0;
}

function incrementScore(token) {
    score[token].score += 1;
}

function decrementScore(token) {
    score[token].score -= 1;
}

function getUserCount() {
    return currentUsers;
}

function resetUserCount() {
    currentUsers = 0;
}

function setMaxUsers(m) {
    maxUsers = m;
}

function spaceAvailable() {
    return currentUsers < maxUsers;
}

function setUserTokens(newUserTokens) {
    userTokens = newUserTokens;
}

function getUserTokens() {
    return userTokens;
}

function resetUserTokens() {
    userTokens = {};
}

function isTokenValid(token) {
    return userTokens.hasOwnProperty(token);
}

function setResetServer(flag) {
    resetServer = flag;
}

function getResetServer() {
    return resetServer;
}


module.exports = {
    addUser: addUser,
    getUserCount: getUserCount,
    setMaxUsers: setMaxUsers,
    spaceAvailable: spaceAvailable,
    setUserTokens: setUserTokens,
    getUserTokens: getUserTokens,
    isTokenValid: isTokenValid,
    incrementScore: incrementScore,
    decrementScore: decrementScore,
    getScore: getScore,
    setResetServer: setResetServer,
    getResetServer: getResetServer,
    resetScore: resetScore,
    resetUserCount: resetUserCount,
    resetUserTokens: resetUserTokens
};