import * as PIXI from "pixi.js";
import { Howl } from "howler";
import TextStyles from "./textStyles.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600);
    this.textObj = new TextStyles(this.app.renderer);

    this.scenes = {
      intro: {},
      select: {}
    };

    this.initScenes();

    this.backgrounds = {};

    this.attachEvents();

    PIXI.loader
      .add([
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/choose.png",
        "assets/images/characters/p1.jpg",
        "assets/images/characters/p2.jpg",
        "assets/images/characters/p3.jpg"
      ])
      .load(() => {
        this.initGame();
      });

    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  attachEvents() {
    window.addEventListener("keydown", e => {
      if (this.scenes.intro.visible) {
        if (e.key === "Enter") {
          this.chooseScreen();
        }
      }
    });
  }

  chooseScreen() {
    this.setActiveScene("select");
    this.stopSound();
    this.playSound("vsmusic", { loop: true });

    let title = this.textObj.customText("SELECT YOUR PLAYER", "center", 520);

    this.backgrounds.player1 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p1.jpg"].texture
    );

    this.backgrounds.player2 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p2.jpg"].texture
    );

    this.backgrounds.player3 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p3.jpg"].texture
    );

    let battle = () => {
      this.stopSound();
      this.playSound("vs");
      this.battleScene();
    };

    for (let bg in this.backgrounds) {
      if (bg === "player1" || bg === "player2" || bg === "player3") {
        if (bg === "player1") {
          this.backgrounds[bg].position.x = 200;
        }

        if (bg === "player2") {
          this.backgrounds[bg].position.x = 400;
        }

        if (bg === "player3") {
          this.backgrounds[bg].position.x = 600;
        }
        this.backgrounds[bg].position.y = 200;
        this.backgrounds[bg].width = 150;
        this.backgrounds[bg].height = 150;
        this.backgrounds[bg].interactive = true;
        this.backgrounds[bg].buttonMode = true;
        this.backgrounds[bg].on("pointerdown", battle);
        this.scenes.select.addChild(this.backgrounds[bg]);
      }
    }

    this.scenes.select.addChild(title);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.select.alpha += 0.05;
    };
    animate();
  }

  stopSound() {
    if (this.sound) {
      this.sound.stop();
    }
  }

  playSound(event, options = { loop: false, bg: false }) {
    let soundPath = "";
    switch (event) {
      case "intro":
        soundPath = "assets/sounds/short/mk3-00054.mp3";
        break;
      default:
        break;
    }

    this.sound = new Howl({
      src: [soundPath],
      loop: options.loop
    });

    this.sound.play();
  }

  introScreen() {
    this.setActiveScene("intro");
    this.playSound("intro");

    let startText = this.textObj.customText(
      "Press Enter to start",
      "center",
      520
    );

    this.scenes.intro.addChild(startText);
  }

  setActiveScene(sceneName) {
    for (let scene in this.scenes) {
      this.scenes[scene].visible = false;
      if (scene === sceneName) {
        this.scenes[scene].visible = true;
      }
    }
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
    this.introScreen();
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
