//defines a bullet object
game.bullet = function() {

    function setPosition(x, y, z) {
        this.bulletObj.position.set(x, y, z);
    }

    function getPosition() {
        return this.bulletObj.position;
    }

    function translateX(newX) {
        this.bulletObj.translateX(newX);
    }

    function translateZ(newZ) {
        this.bulletObj.translateZ(newZ);
    }

    return {
        bulletObj: undefined,
        direction: undefined,
        setPosition: setPosition,
        getPosition: getPosition,
        translateX: translateX,
        translateZ: translateZ
    }
};
