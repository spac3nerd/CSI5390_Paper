/*
    Defines an instance of a game - it relies on a socket already being established and passed in at
    time of instantiation. The idea is to allow the ability to allow multiple instances of the game
    to run on the same screen,but under different canvases. This makes it easier to run automated tests
    as I wouldn't have to launch multiple browsers via CLI and pass in messy parameters via the URL.

 */

//Slightly archaic JS, but I like the extra control over the architecture
//I could have bundled everything with automation tools, but this is easier to set up

//constructor
//canvas - the target cavas element onto which to render
//socket - the established socket with which to communicate with the server
game = function(canvas, socket, token, name) {
    this.canvas = canvas;
    this.socket = socket;
    this.token = token;
    this.name = name;
    this.initCallback = undefined;

    //init world objects to default
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.backgroundMesh = undefined;
    this.redZone = undefined;
    this.intersectionPlane = undefined; //Using this as a dummy math object to calculate the intersection of the mouse position
    this.font = undefined;
    this.fontMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

    //contains all elements of a player tank - all player objects spawn off of it

    this.playerTank = undefined;
    this.otherPlayers = {};
    this.bullets = {};
    this.movementVector = new THREE.Vector3(0, 0, 0);
    this.movementVelocity = 0;// new THREE.Vector3(0, 0, 0); //received from the server
    this.lastRender = undefined; //the timestamp of the last render loop - use to calculate movement interpolation
    this.pressedMovementKey = {
        a: false,
        d: false,
        s: false,
        w: false
    };
    this.clicked = false;
};

game.prototype = {
    //set up an instance of the game
    init: function(callback) {
        console.log("init");
        console.log(this.canvas);
        console.log(this.socket);
        this.initCallback = callback;
        this.configSocket();
        console.log(this.name);
        this.socket.emit('joinGame', {
            token: this.token,
            name: this.name
        });
        //load the typeface font
        let loader = new THREE.FontLoader();
        let that = this;
        loader.load( document.location.origin + "/lib/helvetiker_regular.typeface.json", function (font) {
            that.font = font;
        });
    },

    configSocket: function() {
        let that = this;
        this.socket.on("playerStart", function(data) {
            console.log("playerStart");
            console.log(data);
            that.initScene(data);
        });
        this.socket.on("tick", function(data) {

            if (data.players[that.token] === undefined) {
                return;
            }
            //set player position
            let newPost = data.players[that.token].position;
            if (newPost !== undefined) {
                that.playerTank.setPosition(newPost.x, newPost.y, newPost.z)
            }
            delete data.players[that.token];

            that.updateOtherPlayers(data.players);
            that.updateBullets(data.bullets);
            that.updateScore(data.score);
        });
    },

    updateOtherPlayers: function(playerData) {
        for (let k in playerData) {
            //if a client-side representation does not exit, create it
            if (!this.otherPlayers.hasOwnProperty(k)) {
                this.createNewTank(k, playerData[k]);
            }
            //if representation already exists
            else {
                this.otherPlayers[k].setPosition(playerData[k].position.x, playerData[k].position.y, playerData[k].position.z);
                this.otherPlayers[k].setLookAt(new THREE.Vector3(playerData[k].lookAt.x, 5, playerData[k].lookAt.z));
            }
        }
    },

    updateBullets: function(bulletData) {
        for (let k in bulletData) {
            //if a client-side representation does not exit, create it
            if (!this.bullets.hasOwnProperty(k)) {
                this.createNewBullet(k, bulletData[k]);
            }
            //if representation already exists
            else {
                this.bullets[k].setPosition(bulletData[k].position.x, bulletData[k].position.y, bulletData[k].position.z);
            }
        }
    },

    updateScore: function(scoreData) {
        for (let k in scoreData) {
            //update player score
            if (this.token === k) {
                //only update on score change - changing 3D text is expensive
                if (scoreData[k].score !== this.playerTank.score) {
                    this.playerTank.group.remove(this.playerTank.text);
                    let textGeo = new THREE.TextGeometry(scoreData[k].name + ": " + scoreData[k].score, {
                        font: this.font,
                        size: 2,
                        height: 2,
                        curveSegments: 12,
                        bevelEnabled: false
                    });
                    textGeo =  new THREE.BufferGeometry().fromGeometry(textGeo);
                    textGeo.translate(0, 5, -5);
                    let fontMesh = new THREE.Mesh(textGeo, this.fontMaterial);
                    fontMesh.setRotationFromEuler(new THREE.Euler( -Math.PI / 2, 0, 0, 'XYZ' ));
                    this.playerTank.text = fontMesh;
                    this.playerTank.group.add(fontMesh);
                    this.playerTank.score = scoreData[k].score;
                }
            }
            //update other players
            else if (this.otherPlayers.hasOwnProperty(k)) {
                if (scoreData[k].score !== this.otherPlayers[k].score) {
                    this.otherPlayers[k].group.remove(this.otherPlayers[k].text);
                    let textGeo = new THREE.TextGeometry(scoreData[k].name + ": " + scoreData[k].score, {
                        font: this.font,
                        size: 2,
                        height: 2,
                        curveSegments: 12,
                        bevelEnabled: false
                    });
                    textGeo = new THREE.BufferGeometry().fromGeometry(textGeo);
                    textGeo.translate(0, 5, -5);
                    let fontMesh = new THREE.Mesh(textGeo, this.fontMaterial);
                    fontMesh.setRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0, 'XYZ'));
                    this.otherPlayers[k].text = fontMesh;
                    this.otherPlayers[k].group.add(fontMesh);
                    this.otherPlayers[k].score = scoreData[k].score;
                }
            }
        }
    },

    createNewTank: function(id, state) {
        console.log(state);
        this.otherPlayers[id] = new game.tank();
        this.otherPlayers[id].body = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0x57f92a}));
        this.otherPlayers[id].body.position.set(0, 0, 0);

        this.otherPlayers[id].turret = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 32), new THREE.MeshBasicMaterial({color: 0xf92a2a}));
        this.otherPlayers[id].turret.position.set(0, 3, 0);
        this.otherPlayers[id].turret.up.set(0, 0, -1);

        let gunGeometry = new THREE.BoxGeometry(0.5, 0.5, 5);
        gunGeometry.translate(0, 0, 3);
        this.otherPlayers[id].gun = new THREE.Mesh(gunGeometry, new THREE.MeshBasicMaterial({color: 0x333333}));
        this.otherPlayers[id].gun.position.set(0, 5, 0);
        this.otherPlayers[id].gun.up.set(0, 0, -1);

        this.otherPlayers[id].turretGroup = new THREE.Group();
        this.otherPlayers[id].turretGroup.add(this.otherPlayers[id].turret);
        this.otherPlayers[id].turretGroup.add(this.otherPlayers[id].gun);
        this.otherPlayers[id].turretGroup.up.set(0, 0, -1);
        this.otherPlayers[id].turretGroup.position.set(0, 5, 0);

        let textGeo = new THREE.TextGeometry(state.name + ": 0", {
            font: this.font,
            size: 2,
            height: 2,
            curveSegments: 12,
            bevelEnabled: false
        });
        textGeo =  new THREE.BufferGeometry().fromGeometry(textGeo);
        textGeo.translate(0, 5, -5);
        let fontMesh = new THREE.Mesh(textGeo, this.fontMaterial);
        fontMesh.setRotationFromEuler(new THREE.Euler( -Math.PI / 2, 0, 0, 'XYZ' ));
        this.otherPlayers[id].text = fontMesh;

        this.otherPlayers[id].group = new THREE.Group();
        this.otherPlayers[id].group.add(this.otherPlayers[id].body);
        this.otherPlayers[id].group.add(this.otherPlayers[id].turretGroup);
        this.otherPlayers[id].group.add(this.otherPlayers[id].text);
        this.otherPlayers[id].group.position.set(state.position.x, state.position.y, state.position.z);
        this.otherPlayers[id].group.up.set(0, 0, -1);

        this.otherPlayers[id].setLookAt(new THREE.Vector3(state.lookAt.x, 5, state.lookAt.z));

        // this.scene.add(this.playerTank.body);
        // this.scene.add(this.playerTank.turret);
        this.otherPlayers[id].score = 0;
        this.scene.add(this.otherPlayers[id].group);
    },

    createNewBullet: function(token, data) {
        this.bullets[token] = new game.bullet();
        this.bullets[token].bulletObj = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), new THREE.MeshBasicMaterial({color: 0x000000}));
        this.bullets[token].bulletObj.position.set(data.position.x, data.position.y, data.position.z);
        this.bullets[token].bulletObj.up.set(0, 0, -1);

        this.scene.add(this.bullets[token].bulletObj);
    },

    initScene: function(newPlayerData) {
        this.movementVelocity = newPlayerData.movementVelocity;

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-55, 55, 55, -55, 1, 100); //create a fixed orthographic camera
        this.camera.position.set(0, 50, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0 , 0));
        this.renderer = new THREE.WebGLRenderer({
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.canvas.append(this.renderer.domElement); //append renderer to DOM
        if (this.initCallback !== undefined) {
            this.initCallback();
        }
        //set up the game field
        this.backgroundMesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 32), new THREE.MeshBasicMaterial( {color: 0xd1d1d1, side: THREE.DoubleSide} ));
        this.backgroundMesh.setRotationFromEuler(new THREE.Euler( Math.PI / 2, 0, 0, 'XYZ' )); //rotate to coincide with -Z axis into the screen
        this.redZone = new THREE.Mesh(new THREE.PlaneGeometry(110, 110, 32), new THREE.MeshBasicMaterial( {color: 0xff3535, side: THREE.DoubleSide} ));
        this.redZone.position.set(0, -10, 0); //set behind the main field
        this.redZone.setRotationFromEuler(new THREE.Euler( Math.PI / 2, 0, 0, 'XYZ' ));
        this.scene.add(this.backgroundMesh);
        this.scene.add(this.redZone);

        //not really part of the scene, just used to help with some math
        this.intersectionPlane = new THREE.Mesh(new THREE.PlaneGeometry(120, 120, 32, 32), new THREE.MeshBasicMaterial({color: 0x00FFFF, visible: false}));
        this.intersectionPlane.position.set(0, 5, 0);
        this.intersectionPlane.setRotationFromEuler(new THREE.Euler( -Math.PI / 2, 0, 0, 'XYZ' ));
        //this.intersectionPlane.up.set(0, 1, 0);
        this.scene.add(this.intersectionPlane);

        //spawn player at the location given by the server
        //TODO - merge with creating other player tanks
        this.playerTank = new game.tank();
        this.playerTank.body = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0x1900ff}));
        this.playerTank.body.position.set(0, 0, 0);

        this.playerTank.turret = new THREE.Mesh(new THREE.SphereGeometry(1.25, 32, 32), new THREE.MeshBasicMaterial({color: 0xf6ff00}));
        this.playerTank.turret.position.set(0, 3, 0);
        this.playerTank.turret.up.set(0, 0, -1);

        let gunGeometry = new THREE.BoxGeometry(0.5, 0.5, 5);
        gunGeometry.translate(0, 0, 3);
        this.playerTank.gun = new THREE.Mesh(gunGeometry, new THREE.MeshBasicMaterial({color: 0x333333}));
        this.playerTank.gun.position.set(0, 5, 0);
        this.playerTank.gun.up.set(0, 0, -1);

        this.playerTank.turretGroup = new THREE.Group();
        this.playerTank.turretGroup.add(this.playerTank.turret);
        this.playerTank.turretGroup.add(this.playerTank.gun);
        this.playerTank.turretGroup.up.set(0, 0, -1);
        this.playerTank.turretGroup.position.set(0, 5, 0);

        let textGeo = new THREE.TextGeometry(this.name + ": 0", {
            font: this.font,
            size: 2,
            height: 2,
            curveSegments: 12,
            bevelEnabled: false
        });
        textGeo =  new THREE.BufferGeometry().fromGeometry(textGeo);
        textGeo.translate(0, 5, -5);
        let fontMesh = new THREE.Mesh(textGeo, this.fontMaterial);
        fontMesh.setRotationFromEuler(new THREE.Euler( -Math.PI / 2, 0, 0, 'XYZ' ));
        this.playerTank.text = fontMesh;

        this.playerTank.group = new THREE.Group();
        this.playerTank.group.add(this.playerTank.body);
        this.playerTank.group.add(this.playerTank.turretGroup);
        this.playerTank.group.add(this.playerTank.text);
        this.playerTank.group.position.set(newPlayerData.pos.x, newPlayerData.pos.y, newPlayerData.pos.z);
        this.playerTank.group.up.set(0, 0, -1);

        this.playerTank.setLookAt(new THREE.Vector3(0, 5, -40));

       // this.scene.add(this.playerTank.body);
       // this.scene.add(this.playerTank.turret);
        this.playerTank.score = 0;
        this.scene.add(this.playerTank.group);

        //add event listeners on the canvas container
        let that = this; //context will be switched on event callback, this saves the correct one locally
        //determine the point at which the player is aiming
        this.canvas.onmousemove = function(e) {
            let raycaster = new THREE.Raycaster();
            let mousePosition = new THREE.Vector2(0, 0);
            //the position on the canvas element has to be mapped to the 3D world
            mousePosition.x = (e.clientX / that.canvas.clientWidth) * 2 - 1;
            mousePosition.y = -(e.clientY / that.canvas.clientHeight) * 2 + 1;
            raycaster.setFromCamera(mousePosition, that.camera);
            let intersections = raycaster.intersectObject(that.intersectionPlane);
            //there shouldn't be more than 1 intersection, but we'll just get the first element anyways
            if (intersections.length > 0) {
                that.playerTank.setLookAt(new THREE.Vector3(intersections[0].point.x, intersections[0].point.y, intersections[0].point.z));
            }
        };

        //movement controls should be spawned off as a separate module, but this is fine for now
        this.canvas.parentElement.onkeydown = function(e) {
            if (e.key === "a" || e.key === "d" || e.key === "s" || e.key === "w") {
                //let v = new THREE.Vector3(0, 0 ,0); // will add the component movements based on pressed keys, then it will be nomalized
                switch (e.key) {
                    case "a" :
                        //that.movementVector.x = that.movementVector.x - 1;
                        that.pressedMovementKey.a = true;
                        break;
                    case "d" :
                        //that.movementVector.x = that.movementVector.x + 1;
                        that.pressedMovementKey.d = true;
                        break;
                    case "s" :
                        //that.movementVector.z = that.movementVector.z + 1;
                        that.pressedMovementKey.s = true;
                        break;
                    case "w" :
                        //that.movementVector.z = that.movementVector.z - 1;
                        that.pressedMovementKey.w = true;
                        break;
                }
                //that.movementVector.normalize();
            }
        };

        this.canvas.parentElement.onkeyup = function(e) {
            if (e.key === "a" || e.key === "d" || e.key === "s" || e.key === "w") {
                switch (e.key) {
                    case "a" :
                        that.pressedMovementKey.a = false;
                        break;
                    case "d" :
                        that.pressedMovementKey.d = false;
                        break;
                    case "s" :
                        that.pressedMovementKey.s = false;
                        break;
                    case "w" :
                        that.pressedMovementKey.w = false;
                        break;
                }
            }
        };

        this.canvas.onmousedown = function(e) {
            //check for left mouse button
            if (e.button === 0) {
                //inform server that the player has taken a shot
                that.socket.emit('shot', {
                    token: that.token,
                    lookAt: that.playerTank.getLookAt()
                });
                //knowing that we are guaranteed that the server will receive the shot message, we can start to simulate the bullet now
                //that.createNewBullet();
            }
        };

        this.render();
    },

    render: function() {
        if (this.lastRender !== undefined) {
            let newTime = new Date();
            let delta = (newTime - this.lastRender) / 1000; //time difference in seconds
            this.lastRender = newTime;

            //calculate the movement vector by checking the current keys that are pressed
            //controls on X axis
            if (this.pressedMovementKey.a === true) {
                this.movementVector.x = this.movementVector.x - 1;
            }

            if (this.pressedMovementKey.d === true) {
                this.movementVector.x = this.movementVector.x + 1;
            }
            if (this.pressedMovementKey.d === false && this.pressedMovementKey.a === false) {
                this.movementVector.x = 0;
            }

            //controls on Z axis
            if (this.pressedMovementKey.s === true) {
                this.movementVector.z = this.movementVector.z + 1;
            }
            if (this.pressedMovementKey.w === true) {
                this.movementVector.z = this.movementVector.z - 1;
            }
            if (this.pressedMovementKey.s === false && this.pressedMovementKey.w === false) {
                this.movementVector.z = 0;
            }
            this.movementVector.normalize();

            //translate the player tank to new position
            this.playerTank.translateX((this.movementVector.x * this.movementVelocity) * delta);
            this.playerTank.translateZ((this.movementVector.z * this.movementVelocity) * delta);
        }
        else {
            this.lastRender = new Date();
        }

        //update the server on this player's state
        this.socket.emit('playerUpdate', {
            token: this.token,
            tankState: {
                movement: this.movementVector,
                lookAt: this.playerTank.getLookAt()
            }
        });

        //used only for simulated clicks
        if (this.clicked) {
            this.socket.emit('shot', {
                token: this.token,
                lookAt: this.playerTank.getLookAt()
            });
            this.clicked = false;
        }

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

};
