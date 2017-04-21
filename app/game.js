import * as PIXI from "pixi.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600);

    this.scenes = {
      intro: {}
    };

    this.initScenes();

    this.backgrounds = {};

    PIXI.loader.add(["assets/images/backgrounds/intro.png"]).load(() => {
      this.initGame();
    });

    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  initScenes() {
    for (let scene in this.scenes) {
      this.scenes[scene] = new PIXI.Container();
      this.app.stage.addChild(this.scenes[scene]);
    }
  }

  // Set intro Container, first scene
  initGame() {
    this.loadBackgrounds();
  }

  loadBackgrounds() {
    this.backgrounds.intro = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/intro.png"].texture
    );
    this.setBGScale(this.backgrounds.intro);
    this.scenes.intro.addChild(this.backgrounds.intro);
  }

  setBGScale(sprite) {
    const winAspectRatio = 1000 / 600;
    const bgAspectRatio = sprite.texture.width / sprite.texture.height;
    let ratio;

    if (winAspectRatio > bgAspectRatio) {
      ratio = 1000 / sprite.texture.width;
    } else {
      ratio = 600 / sprite.texture.height;
    }

    sprite.scale.x = ratio;
    sprite.scale.y = ratio;

    sprite.x = (1000 - sprite.width) / 2;
    sprite.y = (600 - sprite.height) / 2;
  }
}

export default Game;
