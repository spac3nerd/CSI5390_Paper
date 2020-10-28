//defines a player object
game.tank = function() {
    function setLookAt(newLookAt) {
        this.lookAt = newLookAt;
        this.gun.lookAt(newLookAt);
        //this.turretGroup.updateMatrixWorld();
    }

    function getLookAt() {
        return this.lookAt;
    }

    function setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }

    function getPosition() {
        return this.group.position;
    }

    function translateX(newX) {
        this.group.translateX(newX);
    }

    function translateZ(newZ) {
        this.group.translateZ(newZ);
    }

    return {
        body: undefined,
        turret: undefined,
        gun: undefined,
        position: undefined,
        lookAt: undefined,
        linearVelocity: undefined,
        turretGroup: undefined, //turret will have its own group since lookAt only affects the gun/turret
        group: undefined, //threejs hierarchy of constituent parts,
        isAlive: false,
        xVelocity: 0,
        yVelocity: 0,
        text: undefined,
        score: 0,
        setLookAt: setLookAt,
        getLookAt: getLookAt,
        setPosition: setPosition,
        getPosition: getPosition,
        translateX: translateX,
        translateZ: translateZ
    }
};
