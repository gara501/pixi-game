import * as PIXI from "pixi.js";
import * as COLI from "./bump.js";
import * as SOUND from "howler";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600);
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

    this.keys = {};

    this.gravity = 1.3;
    this.groundY = 315;

    this.attachEvents();

    this.coli = new COLI(PIXI);

    PIXI.loader
      .add([
        "assets/images/characters/scorpion.json",
        "assets/images/characters/subzero.json",
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/choose.jpg",
        "assets/images/characters/p1.jpg",
        "assets/images/characters/p2.jpg",
        "assets/images/characters/p3.jpg",
        "assets/images/backgrounds/combat.jpg",
        "assets/sounds/fight.mp3",
        "assets/sounds/hitsounds/mk3-00100.mp3",
        "assets/sounds/hitsounds/mk3-00105.mp3",
        "assets/sounds/hitsounds/mk3-00165.mp3",
        "assets/sounds/hitsounds/mk3-00170.mp3",
        "assets/sounds/male/mk3-03000.mp3",
        "assets/sounds/short/mk3-00054.mp3",
        "assets/sounds/short/mk3-00053.mp3"
      ])
      .load(() => {
        this.initGame();
      });
    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  playSound(event, options = { loop: false }) {
    let soundPath = "";
    switch (event) {
      case "kick":
        soundPath = "assets/sounds/hitsounds/mk3-00100.mp3";
        break;
      case "punch":
        soundPath = "assets/sounds/hitsounds/mk3-00105.mp3";
        break;
      case "hit":
        soundPath = "assets/sounds/male/mk3-03000.mp3";
        break;
      case "nopunch":
        soundPath = "assets/sounds/hitsounds/mk3-00165.mp3";
        break;
      case "nokick":
        soundPath = "assets/sounds/hitsounds/mk3-00170.mp3";
        break;
      case "intro":
        soundPath = "assets/sounds/short/mk3-00054.mp3";
        break;
      case "vs":
        soundPath = "assets/sounds/short/mk3-00053.mp3";
        break;
      case "fight":
        soundPath = "assets/sounds/fight.mp3";
        break;
      default:
        break;
    }

    let sound = new Howl({
      src: [soundPath],
      loop: options.loop
    });
    sound.play();
  }

  loadBackgrounds() {
    this.backgrounds.intro = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/intro.png"].texture
    );
    this.setBGScale(this.backgrounds.intro);
    this.introScene.addChild(this.backgrounds.intro);

    this.backgrounds.battle = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/combat.jpg"].texture
    );
    this.setBGScale(this.backgrounds.battle);
    this.gameScene.addChild(this.backgrounds.battle);

    this.backgrounds.gameOver = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/choose.jpg"].texture
    );
    this.gameOverScene.addChild(this.backgrounds.gameOver);
    this.selectScene.addChild(this.backgrounds.gameOver);
  }

  // Set intro Container, first scene
  initGame() {
    this.setupKeys();
    this.loadBackgrounds();
    this.introScreen();

    this.app.ticker.add(() => {
      this.character1Actions.stance.visible = false;
      this.character1Actions.walk.visible = false;
      this.character1Actions.duck.visible = false;
      this.character1Actions.kick.visible = false;
      this.character1Actions.raise.visible = false;
      this.character1Actions.punch.visible = false;
      this.character1Actions.jump.visible = false;
      this.character1Actions.staticjump.visible = false;

      let collision = this.coli.rectangleCollision(
        this.character1,
        this.character2
      );

      if (
        this.character2Actions.hit.visible &&
        this.character2Actions.hit.currentFrame + 1 ===
          this.character2Actions.hit.totalFrames
      ) {
        this.character2Actions.stance.visible = true;
        this.character2Actions.hit.visible = false;
      }

      if (
        this.character2Actions.highhit.visible &&
        this.character2Actions.highhit.currentFrame + 1 ===
          this.character2Actions.highhit.totalFrames
      ) {
        this.character2Actions.stance.visible = true;
        this.character2Actions.highhit.visible = false;
      }

      if (
        this.action !== "jump-right" &&
        this.keys.up.isDown &&
        this.keys.right.isDown
      ) {
        this.action = "jump-right";
        this.character1Actions.jump.gotoAndPlay(0);
      }

      if (
        this.action !== "jump-left" &&
        this.keys.up.isDown &&
        this.keys.left.isDown
      ) {
        this.action = "jump-left";
        this.character1Actions.jump.gotoAndPlay(0);
      }

      switch (this.action) {
        case "ducking":
          this.character1Actions.duck.visible = true;
          break;
        case "walk-right":
          this.character1Actions.walk.visible = true;

          collision = this.coli.rectangleCollision(
            this.character1,
            this.character2
          );

          if (!collision || collision === "left") {
            this.character1.x += this.character1.vx;
          }
          break;
        case "walk-left":
          this.character1Actions.walk.visible = true;

          collision = this.coli.rectangleCollision(
            this.character1,
            this.character2
          );

          if (!collision || collision === "right") {
            this.character1.x -= this.character1.vx;
          }
          break;
        case "kick":
          this.character1Actions.kick.visible = true;

          if (
            this.character1Actions.kick.currentFrame + 1 ===
            this.character1Actions.kick.totalFrames
          ) {
            this.action = "stance";
          }

          collision = this.coli.rectangleCollision(
            this.character1,
            this.character2
          );

          if (collision) {
            this.character2Actions.hit.gotoAndPlay(0);

            this.character2Actions.stance.visible = false;
            this.character2Actions.hit.visible = true;

            this.playSound("kick");
            this.playSound("hit");
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

          collision = this.coli.rectangleCollision(
            this.character1,
            this.character2
          );

          if (collision) {
            this.character2Actions.highhit.gotoAndPlay(0);

            this.character2Actions.stance.visible = false;
            this.character2Actions.highhit.visible = true;

            this.playSound("punch");
            this.playSound("hit");
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
        case "jump-right":
          this.character1Actions.jump.visible = true;

          this.character1.vy += this.gravity;

          if (this.character1.y <= this.groundY) {
            this.character1.x += this.character1.vx * 2.5;
            this.character1.y += this.character1.vy;
          } else {
            this.character1.y = this.groundY;
            if (this.keys.right.isDown) {
              this.action = "walk-right";
            } else {
              this.action = "stance";
            }
          }
          break;

        case "jump-left":
          this.character1Actions.jump.visible = true;

          this.character1.vy += this.gravity;

          if (this.character1.y <= this.groundY) {
            this.character1.x -= this.character1.vx * 2.5;
            this.character1.y += this.character1.vy;
          } else {
            this.character1.y = this.groundY;
            if (this.keys.left.isDown) {
              this.action = "walk-left";
            } else {
              this.action = "stance";
            }
          }
          break;

        case "jump":
          this.character1Actions.staticjump.visible = true;

          this.character1.vy += this.gravity;

          if (this.character1.y <= this.groundY) {
            this.character1.y += this.character1.vy;
          } else {
            this.character1.y = this.groundY;

            this.action = "stance";
          }
          break;
      }
    });
  }

  introScreen() {
    this.introScene.visible = false;
    this.selectScene.visible = false;
    this.gameScene.visible = true;
    this.gameOverScene.visible = false;

    this.playSound("intro");

    let startText = this.textObj.customText(
      "Press Enter to start",
      "center",
      520
    );

    this.introScene.addChild(startText);

    const scorpionStance = this.createAnimation("scorpion-stance", 9);
    const scorpionWalk = this.createAnimation("scorpion-walk", 9);
    const scorpionDuck = this.createAnimation("scorpion-duck", 3);
    const scorpionKick = this.createAnimation("scorpion-kick", 10);
    const scorpionRaise = this.createAnimation("scorpion-duck", 3, true);
    const scorpionPunch = this.createAnimation("scorpion-punch", 5);
    const scorpionJump = this.createAnimation("scorpion-jump", 9);
    const scorpionStaticjump = this.createAnimation("scorpion-staticjump", 1);

    const subzeroStance = this.createAnimation("subzero-stance", 9);
    const subzeroHit = this.createAnimation("subzero-hit", 5);
    const subzeroHighhit = this.createAnimation("subzero-highhit", 5);

    this.character1 = new PIXI.Container();
    this.character1.x = this.app.renderer.width / 3;
    this.character1.y = this.groundY;

    this.character1.scale.x = 1.5;
    this.character1.scale.y = 1.5;

    this.character2 = new PIXI.Container();
    this.character2.x = this.app.renderer.width / 1.3;
    this.character2.y = this.groundY;

    this.character2.scale.x = 1.5;
    this.character2.scale.y = 1.5;

    scorpionStance.animationSpeed = 0.15;
    scorpionWalk.animationSpeed = 0.15;
    scorpionDuck.animationSpeed = 0.4;
    scorpionKick.animationSpeed = 0.4;
    scorpionRaise.animationSpeed = 0.4;
    scorpionPunch.animationSpeed = 0.3;
    scorpionJump.animationSpeed = 0.3;

    subzeroStance.animationSpeed = 0.15;
    subzeroHit.animationSpeed = 0.35;
    subzeroHighhit.animationSpeed = 0.35;

    scorpionStance.play();
    scorpionWalk.play();
    scorpionDuck.loop = false;
    scorpionKick.loop = false;
    scorpionRaise.loop = false;
    scorpionPunch.loop = false;
    scorpionJump.loop = false;

    subzeroStance.play();
    subzeroHit.loop = false;
    subzeroHit.visible = false;
    subzeroHighhit.loop = false;
    subzeroHighhit.visible = false;

    this.character1Actions = {
      stance: scorpionStance,
      duck: scorpionDuck,
      kick: scorpionKick,
      raise: scorpionRaise,
      punch: scorpionPunch,
      walk: scorpionWalk,
      jump: scorpionJump,
      staticjump: scorpionStaticjump
    };

    this.character2Actions = {
      stance: subzeroStance,
      hit: subzeroHit,
      highhit: subzeroHighhit
    };

    this.groupSprites(this.character1, [
      scorpionStance,
      scorpionDuck,
      scorpionKick,
      scorpionRaise,
      scorpionPunch,
      scorpionWalk,
      scorpionJump,
      scorpionStaticjump
    ]);

    this.groupSprites(this.character2, [
      subzeroStance,
      subzeroHit,
      subzeroHighhit
    ]);

    this.action = "stance";

    this.gameScene.addChild(this.character1);
    this.gameScene.addChild(this.character2);
  }

  chooseScreen() {
    this.introScene.visible = false;
    this.gameScene.visible = false;
    this.gameOverScene.visible = false;
    this.selectScene.visible = true;

    this.playSound("vs");

    let title = this.textObj.customText("CHOOSE YOUR WARRIOR", "center", 520);

    this.backgrounds.player1 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p1.jpg"].texture
    );
    this.backgrounds.player2 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p2.jpg"].texture
    );
    this.backgrounds.player3 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p3.jpg"].texture
    );

    this.backgrounds.player1.x = 200;
    this.backgrounds.player1.y = 200;
    this.backgrounds.player1.width = 150;
    this.backgrounds.player1.height = 150;

    this.backgrounds.player2.x = 400;
    this.backgrounds.player2.y = 200;
    this.backgrounds.player2.width = 150;
    this.backgrounds.player2.height = 150;

    this.backgrounds.player3.x = 600;
    this.backgrounds.player3.y = 200;
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

    this.selectScene.addChild(title);
    this.selectScene.addChild(this.player1);
    this.selectScene.addChild(this.player2);
    this.selectScene.addChild(this.player3);
  }

  battleScene() {
    this.introScene.visible = false;
    this.gameOverScene.visible = false;
    this.selectScene.visible = false;
    this.gameScene.visible = true;
    this.playSound("fight", { loop: true });
  }

  gameOver() {
    this.introScene.visible = false;
    this.gameOverScene.visible = true;
    this.selectScene.visible = false;
    this.gameScene.visible = false;

    let title = this.textObj.customText("GAME OVER", "center", 200);
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      250
    );

    this.gameOverScene.addChild(title);
    this.gameOverScene.addChild(titleContinue);
  }

  gameLoop() {
    requestAnimationFrame(gameLoop);
    //state();
    this.app.renderer.render(this.app.stage);
  }

  createPlayer(options) {
    let playerTexture = PIXI.Texture.fromImage(options.texture);
    let player = new PIXI.Sprite(playerTexture);
    player.x = options.x;
    player.y = options.y;
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
        player.x += options.vx;
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

    sprite.x = (1000 - sprite.width) / 2;
    sprite.y = (600 - sprite.height) / 2;
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

      if (this.gameOverScene.visible) {
        if (e.key === "Enter") {
          this.introScreen();
        }
      }
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
    this.keys.left = Keyboard(65);
    this.keys.up = Keyboard(87);
    this.keys.right = Keyboard(68);
    this.keys.down = Keyboard(83);
    this.keys.j = Keyboard(74);
    this.keys.u = Keyboard(85);

    this.keys.left.press = () => {
      this.action = "walk-left";
      this.character1.vx = 3;
    };

    this.keys.left.release = () => {
      if (this.action !== "jump-left") {
        this.action = "stance";
        this.character1.vx = 0;
      }
    };

    this.keys.right.press = () => {
      this.action = "walk-right";
      this.character1.vx = 3;
    };

    this.keys.right.release = () => {
      if (this.action !== "jump-right") {
        this.action = "stance";
        this.character1.vx = 0;
      }
    };

    this.keys.down.press = () => {
      this.action = "ducking";
      this.character1Actions.duck.gotoAndPlay(0);
    };

    this.keys.down.release = () => {
      this.action = "raise";
      this.character1Actions.raise.gotoAndPlay(0);
    };

    this.keys.j.press = () => {
      this.action = "kick";
      this.character1Actions.kick.gotoAndPlay(0);
      this.playSound("nokick");
    };

    this.keys.u.press = () => {
      this.action = "punch";
      this.character1Actions.punch.gotoAndPlay(0);
      this.playSound("nopunch");
    };

    this.keys.up.press = () => {
      this.action = "jump";
      this.character1.vy = -24;
    };
  }
}

export default Game;
