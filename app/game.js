import * as PIXI from "pixi.js";
import * as COLI from "./bump.js";
import * as SOUND from "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600);
    this.textObj = new TextStyles(this.app.renderer);
    this.utils = new SpriteUtilities(PIXI);
    this.scenes = {
      intro: {},
      select: {},
      game: {},
      gameOver: {},
      youWin: {}
    };

    this.energyBars = {
      left: {
        bars: {
          exterior: {},
          interior: {}
        },
        level: 385
      },
      right: {
        bars: {
          exterior: {},
          interior: {}
        },
        level: 385
      }
    };

    this.initScenes();

    this.energyBarLeft = {};
    this.energyBarLeftInterior = {};
    this.energyBarLeftRed = {};
    this.energyBarRight = {};

    this.backgrounds = {};

    this.keys = {};

    this.gravity = 1.3;
    this.groundY = 315;

    this.attachEvents();

    this.sound = null;

    this.coli = new COLI(PIXI);

    PIXI.loader
      .add([
        "assets/images/characters/scorpion.json",
        "assets/images/characters/subzero.json",
        "assets/images/backgrounds/fight.json",
        "assets/images/characters/munrah.json",
        "assets/images/characters/mummra.json",
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/choose.jpg",
        "assets/images/backgrounds/win.jpg",
        "assets/images/characters/p1.jpg",
        "assets/images/characters/p2.jpg",
        "assets/images/characters/p3.jpg",
        "assets/images/backgrounds/combat.jpg",
        "assets/sounds/fight.mp3",
        "assets/sounds/hitsounds/mk3-00100.mp3",
        "assets/sounds/hitsounds/mk3-00105.mp3",
        "assets/sounds/hitsounds/mk3-00155.mp3",
        "assets/sounds/hitsounds/mk3-00165.mp3",
        "assets/sounds/hitsounds/mk3-00170.mp3",
        "assets/sounds/male/mk3-03000.mp3",
        "assets/sounds/short/mk3-00054.mp3",
        "assets/sounds/short/mk3-00053.mp3",
        "assets/sounds/vsmusic.mp3",
        "assets/sounds/fightScream.mp3",
        "assets/sounds/hitscream.mp3"
      ])
      .load(() => {
        this.initGame();
      });
    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  initScenes() {
    for (let scene in this.scenes) {
      this.scenes[scene] = new PIXI.Container();
      this.scenes[scene].alpha = 0;
      this.app.stage.addChild(this.scenes[scene]);
    }
  }

  setActiveScene(sceneName) {
    for (let scene in this.scenes) {
      this.scenes[scene].visible = false;
      if (scene === sceneName) {
        this.scenes[scene].visible = true;
      }
    }
  }

  playSound(event, options = { loop: false, bg: false }) {
    let soundPath = "";
    switch (event) {
      case "jump":
        soundPath = "assets/sounds/hitsounds/mk3-00155.mp3";
        break;
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
      case "vsmusic":
        soundPath = "assets/sounds/vsmusic.mp3";
        break;
      case "fightScream":
        soundPath = "assets/sounds/fightScream.mp3";
        break;
      case "hitscream":
        soundPath = "assets/sounds/hitscream.mp3";
        break;
      default:
        break;
    }

    if (options.bg) {
      this.bgSound = new Howl({
        src: [soundPath],
        loop: options.loop
      });
      this.bgSound.play();
    } else {
      this.sound = new Howl({
        src: [soundPath],
        loop: options.loop
      });
      this.sound.play();
    }
  }

  stopSound() {
    console.log(this.sound)
    if (this.sound) {
      this.sound.stop();
    }
  }

  stopBgSound() {
    this.bgSound.stop();
  }

  loadBackgrounds() {
    this.backgrounds.intro = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/intro.png"].texture
    );
    this.setBGScale(this.backgrounds.intro);
    this.scenes.intro.addChild(this.backgrounds.intro);

    this.backgrounds.battle = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/combat.jpg"].texture
    );
    this.setBGScale(this.backgrounds.battle);
    this.scenes.game.addChild(this.backgrounds.battle);

    this.backgrounds.gameOver = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/choose.jpg"].texture
    );
    this.scenes.gameOver.addChild(this.backgrounds.gameOver);

    this.backgrounds.win = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/win.jpg"].texture
    );
    this.setBGScale(this.backgrounds.win);
    this.scenes.youWin.addChild(this.backgrounds.win);

    this.scenes.select.addChild(this.backgrounds.gameOver);
  }

  // Set intro Container, first scene
  initGame() {
    this.setupKeys();
    this.loadBackgrounds();
    this.battleScene();
    this.setupCharacters();
    this.gameLoop();
  }

  gameLoop() {
    this.app.ticker.add(() => {
      if (!this.scenes.game.visible) return;

      this.character1Actions.stance.visible = false;
      this.character1Actions.walk.visible = false;
      this.character1Actions.duck.visible = false;
      this.character1Actions.kick.visible = false;
      this.character1Actions.raise.visible = false;
      this.character1Actions.punch.visible = false;
      this.character1Actions.jump.visible = false;
      this.character1Actions.staticjump.visible = false;
      this.character1Actions.airkick.visible = false;
      this.mummraActions.jump.visible = false;
      this.mummraActions.stance.visible = false;
      this.mummraActions.duck.visible = false;

      let collision;

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
        this.action === "jump" && this.keys.up.isDown && this.keys.right.isDown
      ) {
        this.action = "jump-right";
        this.character1Actions.jump.gotoAndPlay(0);
        this.playSound("jump");
      }

      if (
        this.action === "jump" && this.keys.up.isDown && this.keys.left.isDown
      ) {
        this.action = "jump-left";
        this.character1Actions.jump.gotoAndPlay(0);
        this.playSound("jump");
      }

      this.utils.update();

      switch (this.action) {
        case "ducking":
          this.character1Actions.duck.visible = true;
          this.mummraActions.duck.visible = true;
          break;
        case "walk-right":
          this.character1Actions.walk.visible = true;

          collision = this.coli.rectangleCollision(
            this.character1,
            this.character2
          );

          if (!collision || collision === "left") {
            this.character1.position.x += this.character1.vx;
          }
          break;
        case "walk-left":
          this.character1Actions.walk.visible = true;

          collision = this.coli.rectangleCollision(
            this.character1,
            this.character2
          );

          if (!collision || collision === "right") {
            this.character1.position.x -= this.character1.vx;
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

            this.utils.shake(this.scenes.game, 5);

            this.registerHit();
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

            this.utils.shake(this.scenes.game, 0.01, true);

            this.registerHit();
          }
          break;
        case "stance":
          this.character1Actions.stance.visible = true;
          this.mummraActions.stance.visible = true;
          break;
        case "raise":
          this.character1Actions.raise.visible = true;
          this.mummraActions.stance.visible = true;

          if (
            this.character1Actions.raise.currentFrame + 1 ===
            this.character1Actions.raise.totalFrames
          ) {
            this.action = "stance";
          }
          break;
        case "airkick-right":
          this.character1Actions.airkick.visible = true;

          this.character1.vy += this.gravity;

          collision = this.coli.hit(this.character1, this.character2);

          if (collision) {
            this.character2Actions.hit.gotoAndPlay(0);

            if (this.character2Actions.stance.visible) {
              this.playSound("kick");
              this.playSound("hit");

              this.utils.shake(this.scenes.game.children[0], 10);

              this.registerHit();
            }

            this.character2Actions.stance.visible = false;
            this.character2Actions.hit.visible = true;
          }

          if (this.character1.y + this.character1.vy <= this.groundY) {
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
        case "jump-right":
          this.character1Actions.jump.visible = true;

          this.character1.vy += this.gravity;

          if (this.character1.y + this.character1.vy <= this.groundY) {
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

        case "airkick-left":
          this.character1Actions.airkick.visible = true;

          this.character1.vy += this.gravity;

          collision = this.coli.hit(this.character1, this.character2);

          if (collision) {
            this.character2Actions.hit.gotoAndPlay(0);

            if (this.character2Actions.stance.visible) {
              this.playSound("kick");
              this.playSound("hit");
              this.registerHit();
            }

            this.character2Actions.stance.visible = false;
            this.character2Actions.hit.visible = true;
          }

          if (this.character1.y + this.character1.vy <= this.groundY) {
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

        case "jump-left":
          this.character1Actions.jump.visible = true;

          this.character1.vy += this.gravity;

          if (this.character1.y + this.character1.vy <= this.groundY) {
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

        case "airkick":
          this.character1Actions.airkick.visible = true;

          this.character1.vy += this.gravity;

          collision = this.coli.hit(this.character1, this.character2);

          if (collision) {
            this.character2Actions.hit.gotoAndPlay(0);

            if (this.character2Actions.stance.visible) {
              this.playSound("kick");
              this.playSound("hit");
              this.registerHit();
            }

            this.character2Actions.stance.visible = false;
            this.character2Actions.hit.visible = true;
          }

          if (this.character1.y <= this.groundY) {
            this.character1.y += this.character1.vy;
          } else {
            this.character1.y = this.groundY;

            this.action = "stance";
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

          this.mummraActions.jump.visible = true;

          this.mummra.vy += this.gravity;

          if (this.mummra.y <= this.groundY) {
            this.mummra.y += this.mummra.vy;
          } else {
            this.mummra.y = this.groundY;

            this.action = "stance";
          }
          break;
      }
    });
  }

  registerHit() {
    this.energyBars.right.bars.interior.width =
      this.energyBars.right.bars.interior.width - 20;
    this.energyBars.right.bars.interior.position.x =
      this.energyBars.right.bars.interior.position.x + 29;
    if (this.energyBars.right.bars.interior.width <= 0) {
      this.youWin();
    }
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

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.intro.alpha += 0.05;
    };
    animate();
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

  battleScene() {
    this.setActiveScene("game");
    this.stopSound();
    this.playSound("fight", { loop: true, bg: true });

    for (let bar in this.energyBars.left.bars) {
      this.energyBars.left.bars[bar] = new PIXI.Graphics();
      if (bar === "exterior") {
        this.energyBars.left.bars[bar].beginFill(0x910303);
        this.energyBars.left.bars[bar].drawRect(50, 50, 400, 30);
      }
      if (bar === "interior") {
        this.energyBars.left.bars[bar].beginFill(0x0246e7, 0.8);
        this.energyBars.left.bars[bar].drawRect(
          55,
          55,
          this.energyBars.left.level,
          20
        );
      }
      this.energyBars.left.bars[bar].endFill();
      this.scenes.game.addChild(this.energyBars.left.bars[bar]);
    }

    for (let bar in this.energyBars.right.bars) {
      this.energyBars.right.bars[bar] = new PIXI.Graphics();
      if (bar === "exterior") {
        this.energyBars.right.bars[bar].beginFill(0x910303);
        this.energyBars.right.bars[bar].drawRect(550, 50, 400, 30);
      }
      if (bar === "interior") {
        this.energyBars.right.bars[bar].beginFill(0x0246e7);
        this.energyBars.right.bars[bar].drawRect(
          555,
          55,
          this.energyBars.right.level,
          20
        );
      }
      this.scenes.game.addChild(this.energyBars.right.bars[bar]);
    }

    const fightAnim = this.createAnimation("fight", 44);
    fightAnim.loop = false;
    fightAnim.visible = false;
    fightAnim.animationSpeed = 0.42;
    fightAnim.scale.x = 2;
    fightAnim.scale.y = 2;
    fightAnim.x = (1000 - fightAnim.width) / 2 + 16;
    fightAnim.y = (600 - fightAnim.height) / 3;

    const character1Name = this.textObj.customText("scorpion", 53, 48);
    const character2Name = this.textObj.customText("sub-zero", 817, 48);

    setTimeout(() => {
      fightAnim.visible = true;
      fightAnim.play();
      this.playSound("fightScream");
    }, 1000);

    this.scenes.game.addChild(fightAnim);
    this.scenes.game.addChild(character1Name);
    this.scenes.game.addChild(character2Name);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.game.alpha += 0.05;
    };
    animate();
  }

  youWin() {
    this.setActiveScene("youWin");
    this.stopBgSound();
    this.playSound("intro");

    let title = this.textObj.customText("You Win!", "center", 50);
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      90
    );

    this.scenes.youWin.addChild(title);
    this.scenes.youWin.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.youWin.alpha += 0.05;
    };
    animate();
  }

  gameOver() {
    this.setActiveScene("gameOver");
    this.stopSound();
    let title = this.textObj.customText("GAME OVER", "center", 200);
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      250
    );

    this.scenes.gameOver.addChild(title);
    this.scenes.gameOver.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.gameOver.alpha += 0.05;
    };
    animate();
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

  attachEvents() {
    window.addEventListener("keydown", e => {
      if (this.scenes.intro.visible) {
        if (e.key === "Enter") {
          this.chooseScreen();
        }
      }

      if (this.scenes.gameOver.visible) {
        if (e.key === "Enter") {
          this.introScreen();
        }
      }

      if (this.scenes.youWin.visible) {
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
      if (this.character1.y === this.groundY) {
        this.action = "walk-left";
        this.character1.vx = 3;
      }
    };

    this.keys.left.release = () => {
      if (this.character1.y === this.groundY) {
        this.action = "stance";
        this.character1.vx = 0;
      }
    };

    this.keys.right.press = () => {
      if (this.character1.y === this.groundY) {
        this.action = "walk-right";
        this.character1.vx = 3;
      }
    };

    this.keys.right.release = () => {
      if (this.character1.y === this.groundY) {
        this.action = "stance";
        this.character1.vx = 0;
      }
    };

    this.keys.down.press = () => {
      if (this.character1.y === this.groundY) {
        this.action = "ducking";
        this.character1Actions.duck.gotoAndPlay(0);
      }
    };

    this.keys.down.release = () => {
      if (this.character1.y === this.groundY) {
        this.action = "raise";
        this.character1Actions.raise.gotoAndPlay(0);
      }
    };

    this.keys.j.press = () => {
      if (this.character1.y === this.groundY) {
        this.action = "kick";
        this.character1Actions.kick.gotoAndPlay(0);
        if (this.scenes.game.visible) {
          this.playSound("nopunch");
          this.playSound("hitscream");
        }
      } else {
        if (this.action === "jump-right") {
          this.action = "airkick-right";
        } else if (this.action === "jump-left") {
          this.action = "airkick-left";
        } else if (this.action === "jump") {
          this.action = "airkick";
        }
        this.character1Actions.airkick.gotoAndPlay(0);
        if (this.scenes.game.visible) {
          this.playSound("nopunch");
          this.playSound("hitscream");
        }
      }
    };

    this.keys.u.press = () => {
      if (this.character1.y === this.groundY) {
        this.action = "punch";
        this.character1Actions.punch.gotoAndPlay(0);
        if (this.scenes.game.visible) {
          this.playSound("nopunch");
          this.playSound("hitscream");
        }
      }
    };

    this.keys.up.press = () => {
      this.action = "jump";
      this.character1.vy = -24;
      this.mummra.vy = -24;
      this.playSound("jump");
    };
  }

  setupCharacters() {
    const scorpionStance = this.createAnimation("scorpion-stance", 9);
    const scorpionWalk = this.createAnimation("scorpion-walk", 9);
    const scorpionDuck = this.createAnimation("scorpion-duck", 3);
    const scorpionKick = this.createAnimation("scorpion-kick", 10);
    const scorpionRaise = this.createAnimation("scorpion-duck", 3, true);
    const scorpionPunch = this.createAnimation("scorpion-punch", 5);
    const scorpionJump = this.createAnimation("scorpion-jump", 9);
    const scorpionStaticjump = this.createAnimation("scorpion-staticjump", 1);
    const scorpionAirkick = this.createAnimation("scorpion-airkick", 3);

    const subzeroStance = this.createAnimation("subzero-stance", 9);
    const subzeroHit = this.createAnimation("subzero-hit", 5);
    const subzeroHighhit = this.createAnimation("subzero-highhit", 5);

    const munrah = this.createAnimation("munrah", 3);
    munrah.scale.x = .4;
    munrah.scale.y = .4;
    munrah.animationSpeed = .08;
    munrah.y = this.groundY;
    munrah.x = 50;
    munrah.play();
    this.scenes.game.addChild(munrah);

    const mummra = this.createAnimation("mummra", 1);
    const mummraJump = this.createAnimation("mummra-jump", 1);
    const mummraDuck = this.createAnimation("mummra-duck", 1);
    this.mummra = new PIXI.Container();
    this.mummra.scale.x = .25;
    this.mummra.scale.y = .25;
    this.mummra.y = this.groundY;
    this.mummra.x = 170;
    mummra.play();
    this.groupSprites(this.mummra, [
      mummra,
      mummraJump,
      mummraDuck
    ]);
    this.mummraActions = {
      stance: mummra,
      jump: mummraJump,
      duck: mummraDuck
    };
    this.scenes.game.addChild(this.mummra);

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
    scorpionAirkick.animationSpeed = 0.3;

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
    scorpionAirkick.loop = false;

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
      staticjump: scorpionStaticjump,
      airkick: scorpionAirkick
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
      scorpionStaticjump,
      scorpionAirkick
    ]);

    this.groupSprites(this.character2, [
      subzeroStance,
      subzeroHit,
      subzeroHighhit
    ]);

    this.action = "stance";

    this.scenes.game.addChild(this.character1);
    this.scenes.game.addChild(this.character2);
  }
}

export default Game;
