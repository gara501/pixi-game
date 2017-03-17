import { pixiStart } from "./renderer.js";

let pixiApi = new pixiStart();
let player = {
    position: {
        x: 300,
        y: 300
    },
    scale : {
        x: 1,
        y: 1
    },
    anchor : {
        x: .5,
        y: .5
    },
    texture: "assets/images/characters/test.png",
    rotationSpeed: 0.05
};
let player2 = {
    position: {
        x: 100,
        y: 100
    },
    scale : {
        x: 0.5,
        y: 0.5
    },
    anchor : {
        x: .5,
        y: .5
    },
    texture: "assets/images/characters/test.png",
    rotationSpeed: 0.01
};
let player3 = {
    position: {
        x: 100,
        y: 100
    },
    scale : {
        x: 0.5,
        y: 0.5
    },
    anchor : {
        x: .5,
        y: .5
    },
    texture: "assets/images/characters/test.png",
    rotationSpeed: 0
};

pixiApi.createPlayer(player);

pixiApi.createPlayer(player2);
pixiApi.createPlayer(player3);

// rotatePlayer(player, '0.01');

