import * as PIXI from "pixi.js";
import * as PIXIACTION from "pixi-action";
import * as PIXIFILTERS from "pixi-extra-filters";
import * as SOUND from "./sound.js";
import * as COLI from "./bump.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600, { backgroundColor: 0x000000 });
    this.textObj = new TextStyles(this.app.renderer);

    this.introScene = new PIXI.Container();
    this.selectScene = new PIXI.Container();
    this.gameScene = new PIXI.Container();
    this.gameOverScene = new PIXI.Container();

    this.app.stage.addChild(this.introScene);
    this.app.stage.addChild(this.gameScene);
    this.app.stage.addChild(this.selectScene);
    this.app.stage.addChild(this.gameOverScene);

    this.backgrounds = {};

    this.attachEvents();

    PIXI.loader
      .add([
        "assets/images/characters/scorpion.json",
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/choose.jpg",
        "assets/images/characters/p1.jpg",
        "assets/images/characters/p2.jpg",
        "assets/images/characters/p3.jpg",
        "assets/images/backgrounds/combat.jpg"
      ])
      .load(() => {
        this.initGame();
      });
    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  // Set intro Container, first scene
  initGame() {
    this.setupKeys();
    this.introScreen();

    this.app.ticker.add(() => {
      this.character1Actions.stance.visible = false;
      this.character1Actions.walk.visible = false;
      this.character1Actions.duck.visible = false;
      this.character1Actions.kick.visible = false;
      this.character1Actions.raise.visible = false;
      this.character1Actions.punch.visible = false;

      switch (this.action) {
        case "ducking":
          this.character1Actions.duck.visible = true;
          break;
        case "walk-right":
          this.character1Actions.walk.visible = true;
          this.character1.position.x += this.character1.vx;
          break;
        case "walk-left":
          this.character1Actions.walk.visible = true;
          this.character1.position.x -= this.character1.vx;
          break;
        case "kick":
          this.character1Actions.kick.visible = true;

          if (
            this.character1Actions.kick.currentFrame + 1 ===
            this.character1Actions.kick.totalFrames
          ) {
            this.action = "stance";
          }
          break;
        case "punch":
          this.character1Actions.punch.visible = true;

          if (
            this.character1Actions.punch.currentFrame + 1 ===
            this.character1Actions.punch.totalFrames
          ) {
            this.action = "stance";
          }
          break;
        case "stance":
          this.character1Actions.stance.visible = true;
          break;
        case "raise":
          this.character1Actions.raise.visible = true;

          if (
            this.character1Actions.raise.currentFrame + 1 ===
            this.character1Actions.raise.totalFrames
          ) {
            this.action = "stance";
          }
          break;
      }
    });
  }

  loadSounds() {}

  introScreen() {
    this.introScene.visible = true;
    this.selectScene.visible = false;
    this.gameScene.visible = false;
    this.gameOverScene.visible = false;

    this.backgrounds.intro = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/intro.png"].texture
    );

    let startText = this.textObj.introText();

    this.background = this.backgrounds.intro;
    this.setBGScale(this.background);

    this.introScene.addChild(this.background);
    this.introScene.addChild(startText);

    const scorpionStance = this.createAnimation("scorpion-stance", 9);
    const scorpionWalk = this.createAnimation("scorpion-walk", 9);
    const scorpionDuck = this.createAnimation("scorpion-duck", 3);
    const scorpionKick = this.createAnimation("scorpion-kick", 10);
    const scorpionRaise = this.createAnimation("scorpion-duck", 3, true);
    const scorpionPunch = this.createAnimation("scorpion-punch", 5);

    this.character1 = new PIXI.Container();
    this.character1.x = this.app.renderer.width / 3;
    this.character1.y = this.app.renderer.height / 2;

    scorpionStance.animationSpeed = 0.15;
    scorpionWalk.animationSpeed = 0.15;
    scorpionDuck.animationSpeed = 0.4;
    scorpionKick.animationSpeed = 0.4;
    scorpionRaise.animationSpeed = 0.4;
    scorpionPunch.animationSpeed = 0.3;

    scorpionStance.play();
    scorpionWalk.play();
    scorpionWalk.visible = false;
    scorpionDuck.loop = false;
    scorpionDuck.visible = false;
    scorpionKick.loop = false;
    scorpionKick.visible = false;
    scorpionRaise.loop = false;
    scorpionRaise.visible = false;
    scorpionPunch.loop = false;
    scorpionPunch.visible = false;

    this.character1Actions = {
      stance: scorpionStance,
      duck: scorpionDuck,
      kick: scorpionKick,
      raise: scorpionRaise,
      punch: scorpionPunch,
      walk: scorpionWalk
    };

    this.groupSprites(this.character1, [
      scorpionStance,
      scorpionDuck,
      scorpionKick,
      scorpionRaise,
      scorpionPunch,
      scorpionWalk
    ]);

    this.action = "stance";

    this.introScene.addChild(this.character1);
  }

  chooseScreen() {
    this.introScene.visible = false;
    this.gameScene.visible = false;
    this.gameOverScene.visible = false;
    this.selectScene.visible = true;

    let title = this.textObj.chooseText();

    this.backgrounds.choose = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/choose.jpg"].texture
    );

    this.backgrounds.player1 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p1.jpg"].texture
    );
    this.backgrounds.player2 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p2.jpg"].texture
    );
    this.backgrounds.player3 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p3.jpg"].texture
    );

    this.backgrounds.player1.position.x = 200;
    this.backgrounds.player1.position.y = 200;
    this.backgrounds.player1.width = 150;
    this.backgrounds.player1.height = 150;

    this.backgrounds.player2.position.x = 400;
    this.backgrounds.player2.position.y = 200;
    this.backgrounds.player2.width = 150;
    this.backgrounds.player2.height = 150;

    this.backgrounds.player3.position.x = 600;
    this.backgrounds.player3.position.y = 200;
    this.backgrounds.player3.width = 150;
    this.backgrounds.player3.height = 150;

    this.player1 = this.backgrounds.player1;
    this.player2 = this.backgrounds.player2;
    this.player3 = this.backgrounds.player3;

    this.player1.interactive = true;
    this.player2.interactive = true;
    this.player3.interactive = true;

    this.player1.buttonMode = true;
    this.player2.buttonMode = true;
    this.player3.buttonMode = true;

    let battle = () => {
      this.battleScene();
    };

    this.player1.on("pointerdown", battle);
    this.player2.on("pointerdown", battle);
    this.player3.on("pointerdown", battle);

    this.selectScene.addChild(this.backgrounds.choose);

    this.selectScene.addChild(title);
    this.selectScene.addChild(this.player1);
    this.selectScene.addChild(this.player2);
    this.selectScene.addChild(this.player3);

    let animate = () => {
      requestAnimationFrame(animate);
      this.app.renderer.render(this.app.stage);
      PIXI.actionManager.update();
    };
    animate();
  }

  battleScene() {
    console.log("BATLE");
    this.introScene.visible = false;
    this.gameOverScene.visible = false;
    this.selectScene.visible = false;
    this.gameScene.visible = true;

    this.backgrounds.battle = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/combat.jpg"].texture
    );

    this.gameScene.addChild(this.backgrounds.battle);

    let animate = () => {
      requestAnimationFrame(animate);
      this.app.renderer.render(this.app.stage);
      PIXI.actionManager.update();
    };
    animate();
  }

  resizeElement(element) {
    let posx = parseInt(window.innerWidth * 0.05);
    let posy = parseInt(window.innerHeight * 0.1);
    element.position.x = posx;
    element.position.y = posy;
    return element;
  }

  gameLoop() {
    requestAnimationFrame(gameLoop);
    //state();
    this.app.renderer.render(this.app.stage);
  }

  gameOver() {
    this.introScene.visible = false;
    this.selectScene.visible = false;
    this.gameScene.visible = false;
    this.gameOverScene.visible = true;
  }

  createPlayer(options) {
    let playerTexture = PIXI.Texture.fromImage(options.texture);
    let player = new PIXI.Sprite(playerTexture);
    player.position.x = options.position.x;
    player.position.y = options.position.y;
    player.scale.x = options.scale.x;
    player.scale.y = options.scale.y;
    player.anchor.x = options.anchor.x;
    player.anchor.y = options.anchor.y;

    if (options.addToScene) {
      this.app.stage.addChild(player);
    }

    let animate = () => {
      requestAnimationFrame(animate);
      if (options.rotationSpeed > 0) {
        player.rotation += options.rotationSpeed;
      }

      if (options.vx > 0) {
        player.position.x += options.vx;
      }
      this.app.renderer.render(this.app.stage);
      PIXI.actionManager.update();
    };
    animate();
    return player;
  }

  movePlayer(options) {
    let action_move = new PIXI.action.MoveTo(
      options.x,
      options.y,
      options.time
    );
    let animation = PIXI.actionManager.runAction(options.player, action_move);
  }

  createSpriteSheet(options) {
    let localStage = this.app.stage;

    let sprite;
    let animationLoop = () => {
      requestAnimationFrame(animationLoop);
      this.renderer.render(localStage);
    };

    let setup = () => {
      localStage.interactive = true;
      let rect = new PIXI.Rectangle(0, 0, 80, 100);
      let texture = PIXI.loader.resources[options.name].texture;
      texture.frame = rect;

      sprite = new PIXI.Sprite(texture);
      let idle = setInterval(
        function() {
          if (rect.x >= 350) rect.x = 0;
          sprite.texture.frame = rect;
          rect.x += 90;
        },
        300
      );

      sprite.vx = 30;
      localStage.addChild(sprite);

      animationLoop();
    };

    PIXI.loader.add(options.name, options.source).load(setup);

    window.addEventListener("keydown", function(e) {
      if (e.keyCode == "38") {
        // up arrow
      } else if (e.keyCode == "40") {
        // down arrow
      } else if (e.keyCode == "37") {
        sprite.x -= sprite.vx;
      } else if (e.keyCode == "39") {
        sprite.x += sprite.vx;
      }
      e.preventDefault();
    });
  }

  groupSprites(container, options) {
    for (let i = 0; i < options.length; i++) {
      container.addChild(options[i]);
    }
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

    sprite.position.x = (1000 - sprite.width) / 2;
    sprite.position.y = (600 - sprite.height) / 2;
  }

  requestFullscreen() {
    var requestFullscreen = document.body.requestFullScreen ||
      document.body.webkitRequestFullScreen ||
      document.body.mozRequestFullScreen ||
      document.body.msRequestFullScreen;

    requestFullscreen.call(document.body);
  }

  attachEvents() {
    window.addEventListener("keydown", e => {
      if (this.introScene.visible) {
        if (e.key === "Enter") {
          this.chooseScreen();
        }
      }
    });

    window.addEventListener("resize", e => {
      this.app.renderer.resize(1000, 600);
      this.setBGScale(this.background);
      this.resizeElement(this.player1);
    });
  }

  createAnimation(id, numberFrames, reverse = false) {
    let frames = [];

    if (!reverse) {
      for (let i = 1; i <= numberFrames; i++) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    } else {
      for (let i = numberFrames; i > 0; i--) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    }

    const anim = new PIXI.extras.AnimatedSprite(frames);

    return anim;
  }

  setupKeys() {
    const left = Keyboard(37);
    const up = Keyboard(38);
    const right = Keyboard(39);
    const down = Keyboard(40);
    const j = Keyboard(74);
    const u = Keyboard(85);

    left.press = () => {
      this.action = "walk-left";
      this.character1.vx = 1.5;
    };

    left.release = () => {
      this.action = "stance";
      this.character1.vx = 0;
    };

    right.press = () => {
      this.action = "walk-right";
      this.character1.vx = 1.5;
    };

    right.release = () => {
      this.action = "stance";
      this.character1.vx = 0;
    };

    down.press = () => {
      this.action = "ducking";
      this.character1Actions.duck.gotoAndPlay(0);
    };

    down.release = () => {
      this.action = "raise";
      this.character1Actions.raise.gotoAndPlay(0);
    };

    j.press = () => {
      this.action = "kick";
      this.character1Actions.kick.gotoAndPlay(0);
    };

    u.press = () => {
      this.action = "punch";
      this.character1Actions.punch.gotoAndPlay(0);
    };
  }
}

export default Game;
