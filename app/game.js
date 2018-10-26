import * as PIXI from "pixi.js";
import { cheapColi } from "./coli.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";

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

    this.powers = [];
    this.characterNames = [];
    this.action = [];
    this.power = [];
    this.finishHim = false;
    this.switchLeft = true;
    this.switchRight = false;

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

    PIXI.loader
      .add([
        "assets/images/powers/yelo.json",
        "assets/images/powers/fire.json",
        "assets/images/powers/death.json",
        "assets/images/characters/scorpion.json",
        "assets/images/characters/claudia.json",
        "assets/images/characters/pao.json",
        "assets/images/characters/aram.json",
        "assets/images/backgrounds/fight.json",
        "assets/images/backgrounds/intro.png",
        "assets/images/backgrounds/win.jpg",
        "assets/images/characters/aram.jpg",
        "assets/images/characters/scorpion.jpg",
        "assets/images/characters/claudia.png",
        "assets/images/characters/pao.png",
        "assets/images/characters/claudia-portrait.png",
        "assets/images/characters/pao-portrait.png",
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
        "assets/sounds/hitscream.mp3",
        "assets/sounds/finish.mp3",
        "assets/sounds/scream.mp3"
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
      case "scream":
        soundPath = "assets/sounds/scream.mp3";
        break;
      case "hitscream":
        soundPath = "assets/sounds/hitscream.mp3";
        break;
      case "gameover":
        soundPath = "assets/sounds/yousuck.mp3";
        break;
      case "welldone":
        soundPath = "assets/sounds/welldone.mp3";
        break;
      case "finish":
        soundPath = "assets/sounds/finish.mp3";
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

    this.backgrounds.win = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/win.jpg"].texture
    );
    this.setBGScale(this.backgrounds.win);
    this.scenes.youWin.addChild(this.backgrounds.win);
  }

  // Set intro Container, first scene
  initGame() {
    this.loadBackgrounds();
    this.introScreen();
    this.gameLoop();
  }

  gameLoop() {
    this.app.ticker.add(() => {
      if (!this.scenes.game.visible) return;

      this.characters.forEach((character, index) => {
        character.animations.forEach(animation => {
          if (animation.name !== "hit" && animation.name !== "highhit") {
            animation.visible = false;
          }
        });

        let collision;
        const opponent = index === 0 ? this.characters[1] : this.characters[0];

        if (
          opponent.actions.hit &&
          opponent.actions.hit.visible &&
          opponent.actions.hit.currentFrame + 1 ===
            opponent.actions.hit.totalFrames
        ) {
          opponent.actions.stance.visible = true;
          opponent.actions.hit.visible = false;
        }

        if (
          opponent.actions.highhit &&
          opponent.actions.highhit.visible &&
          opponent.actions.highhit.currentFrame + 1 ===
            opponent.actions.highhit.totalFrames
        ) {
          opponent.actions.stance.visible = true;
          opponent.actions.highhit.visible = false;
        }

        if (
          this.action[index] === "jump" &&
          this.keys.up[index].isDown &&
          this.keys.right[index].isDown
        ) {
          this.action[index] = "jump-right";

          this.characters.forEach(character => {
            if (character.actions.jump) {
              character.actions.jump.gotoAndPlay(0);
              this.playSound("jump");
            }
          });
        }

        if (
          this.action[index] === "jump" &&
          this.keys.up[index].isDown &&
          this.keys.left[index].isDown
        ) {
          this.characters.forEach(character => {
            if (character.actions.jump) {
              this.action[index] = "jump-left";
              character.actions.jump.gotoAndPlay(0);
              this.playSound("jump");
            }
          });
        }

        this.utils.update();

        switch (this.power[index]) {
          case "yelo":
            this.powers[index].yelo.visible = true;

            collision = cheapColi(this.powers[index].yelo, opponent);

            if (collision) {
              if (opponent.actions.highhit) {
                opponent.actions.highhit.gotoAndPlay(0);
                opponent.actions.stance.visible = false;
                opponent.actions.highhit.visible = true;
              }

              this.powers[index].yelo.visible = false;
              this.powers[index].yelo.x = -10000;
              this.power[index] = "";

              this.playSound("punch");
              this.playSound("hit");

              this.utils.shake(this.scenes.game, 0.01, true);

              this.registerHit(index);
            } else {
              // TODO: calc direction based on opponent position
              this.powers[index].yelo.x += this.powers[index].yelo.vx;
            }
            break;
          case "fire":
            this.powers[index].fire.visible = true;

            collision = cheapColi(this.powers[index].fire, opponent);

            if (collision) {
              if (opponent.actions.highhit) {
                opponent.actions.highhit.gotoAndPlay(0);
                opponent.actions.stance.visible = false;
                opponent.actions.highhit.visible = true;
              }

              this.powers[index].fire.visible = false;
              this.powers[index].fire.x = -10000;
              this.power[index] = "";

              this.playSound("punch");
              this.playSound("hit");

              this.utils.shake(this.scenes.game, 0.03, true);

              this.registerHit(index);

              let victim = opponent === 0 ? 0 : 1;
              let winner = opponent === 0 ? 1 : 0;
              if (this.finishHim) {
                this.playSound("scream");
                this.action[victim] = "death";
                setTimeout(() => {
                  this.youWin(winner);
                }, 1000);
              }
            } else {
              // TODO: calc direction based on opponent position
              this.powers[index].fire.x += this.powers[index].fire.vx;
            }
            break;
        }
        switch (this.action[index]) {
          case "ducking":
            if (character.actions.duck) {
              character.actions.duck.visible = true;
            }
            break;
          case "death":
            if (character.actions.death) {
              character.actions.death.visible = true;
              character.actions.stance.visible = false;
              character.actions.highhit.visible = false;
              character.actions.hit.visible = false;

              character.position.y += 3;

              if (character.position.y >= this.groundY + 110) {
                character.position.y = this.groundY + 110;
              }
            }
            break;
          case "walk-right":
            if (character.actions.walk) {
              character.actions.walk.visible = true;

              collision = cheapColi(character, opponent);

              if (!collision || collision === "left") {
                character.position.x += character.vx;
              }

              if (character.position.x >= 900) {
                character.position.x = 900;
              }
            }
            break;
          case "walk-left":
            if (character.actions.walk) {
              character.actions.walk.visible = true;

              collision = cheapColi(character, opponent);

              if (!collision || collision === "right") {
                character.position.x -= character.vx;
              }

              if (character.position.x <= 0) {
                character.position.x = 0;
              }
            }
            break;
          case "kick":
            if (character.actions.kick) {
              character.actions.kick.visible = true;

              if (
                character.actions.kick.currentFrame + 1 ===
                character.actions.kick.totalFrames
              ) {
                this.action[index] = "stance";
                this.blockHit = false;
              }

              const collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.hit.visible = true;
                }

                this.playSound("kick");
                this.playSound("hit");

                this.utils.shake(this.scenes.game, 5);

                if (!this.blockHit) {
                  this.registerHit(index);
                  this.blockHit = true;
                }
              }
            }
            break;
          case "punch":
            if (character.actions.punch) {
              character.actions.punch.visible = true;

              if (
                character.actions.punch.currentFrame + 1 ===
                character.actions.punch.totalFrames
              ) {
                this.action[index] = "stance";
                this.blockHit = false;
              }

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.highhit) {
                  opponent.actions.highhit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.highhit.visible = true;
                }

                this.playSound("punch");
                this.playSound("hit");

                this.utils.shake(this.scenes.game, 0.01, true);

                if (!this.blockHit) {
                  this.registerHit(index);
                  this.blockHit = true;
                }
              }
            }
            break;
          case "stance":
            if (
              character.actions.stance &&
              (!character.actions.hit ||
                (!character.actions.hit.visible &&
                  !character.actions.highhit.visible))
            ) {
              character.actions.stance.visible = true;
            }
            break;
          case "raise":
            if (character.actions.raise) {
              character.actions.raise.visible = true;

              if (
                character.actions.raise.currentFrame + 1 ===
                character.actions.raise.totalFrames
              ) {
                this.action[index] = "stance";
              }
            }
            break;
          case "airkick-right":
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.visible = true;
                }

                if (opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");

                  this.utils.shake(this.scenes.game.children[0], 10);

                  this.registerHit(index);
                }
              }

              if (character.y + character.vy <= this.groundY) {
                character.x += character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.right.isDown) {
                  this.action[index] = "walk-right";
                } else {
                  this.action[index] = "stance";
                }
              }
            }
            break;
          case "jump-right":
            if (character.actions.jump) {
              character.actions.jump.visible = true;

              character.vy += this.gravity;

              if (character.y + character.vy <= this.groundY) {
                character.x += character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.right.isDown) {
                  this.action[index] = "walk-right";
                } else {
                  this.action[index] = "stance";
                }
              }

              if (character.position.x >= 900) {
                character.position.x = 900;
              }
            }
            break;

          case "airkick-left":
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.visible = true;
                }

                if (opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");
                  this.registerHit(index);
                }
              }

              if (character.y + character.vy <= this.groundY) {
                character.x -= character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.left.isDown) {
                  this.action[index] = "walk-left";
                } else {
                  this.action[index] = "stance";
                }
              }
            }
            break;

          case "jump-left":
            if (character.actions.jump) {
              character.actions.jump.visible = true;
              character.vy += this.gravity;

              if (character.y + character.vy <= this.groundY) {
                character.x -= character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.left.isDown) {
                  this.action[index] = "walk-left";
                } else {
                  this.action[index] = "stance";
                }
              }

              if (character.position.x <= 0) {
                character.position.x = 0;
              }
            }
            break;

          case "airkick":
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = cheapColi(character, opponent);

              if (collision) {
                if (opponent.actions.hit) {
                  opponent.actions.hit.gotoAndPlay(0);
                  opponent.actions.stance.visible = false;
                  opponent.actions.hit.visible = true;
                }

                if (opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");
                  this.registerHit(index);
                }
              }

              if (character.y <= this.groundY) {
                character.y += character.vy;
              } else {
                character.y = this.groundY;

                this.action[index] = "stance";
              }
            }
            break;

          case "jump":
            if (character.actions.jump) {
              character.actions.staticjump.visible = true;
              character.vy += this.gravity;

              if (character.y <= this.groundY) {
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                this.action[index] = "stance";
              }
            }
            break;
        }
      });
    });
  }

  registerHit(index) {
    const side = index === 1 ? "left" : "right";
    // why these numbers? how knows
    const increment = index === 1 ? 23 : 29;

    this.energyBars[side].bars.interior.width =
      this.energyBars[side].bars.interior.width - 20;
    this.energyBars[side].bars.interior.position.x =
      this.energyBars[side].bars.interior.position.x + increment;
    if (this.energyBars[side].bars.interior.width <= 0) {
      this.energyBars[side].bars.interior.width = this.energyBars[
        side
      ].bars.level;
      this.energyBars[side].bars.interior.position.x = 55;
      this.finish(side);
    }
  }

  finish(side) {
    var winner = side === "left" ? 1 : 0;
    this.playSound("finish");
    this.finishHim = true;
    let finishHimText = this.textObj.finishText("FINISH HIM!", "center", 100);
    this.scenes.game.addChild(finishHimText);
    this.characters.forEach((character, index) => {
      if (winner !== index) {
        character.isDeath = true;
        this.action[index] = "stance";
        character.vx = 0;
      }
    });
  }

  introScreen() {
    this.setActiveScene("intro");
    this.playSound("intro");

    let startText = this.textObj.customText(
      "Press Enter to start",
      "center",
      520
    );

    let titleText = this.textObj.finishText("HUGE COMBAT", "center", 240, 140);

    let comands = this.textObj.comandsText(
      "Player 1: A (left), D (right), S (down), W (up)",
      20,
      70
    );

    let comandsHits = this.textObj.comandsText(
      "Hits: F (kick), G (punch), H (power) and j (fatality)",
      20,
      110
    );

    let comands2 = this.textObj.comandsText("Player 2: Arrows", 580, 70);

    let comandsHits2 = this.textObj.comandsText(
      "Hits: P (kick), O (punch), I (power) and U (fatality)",
      580,
      110
    );

    this.scenes.intro.addChild(comands);
    this.scenes.intro.addChild(comandsHits);
    this.scenes.intro.addChild(comands2);
    this.scenes.intro.addChild(comandsHits2);
    this.scenes.intro.addChild(startText);
    this.scenes.intro.addChild(titleText);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.intro.alpha += 0.05;
    };
    animate();
  }

  chooseScreen() {
    this.characters = [];

    this.setActiveScene("select");
    this.stopSound();
    this.playSound("vsmusic", { loop: true });

    let title = this.textObj.customText("SELECT PLAYER 1", "center", 520);
    let counter = 1;
    let counter2 = 0;
    let initialPosition = 70;

    characterData.characters.forEach(data => {
      if (data.active) {
        this.backgrounds["player" + counter] = PIXI.Sprite.from(
          PIXI.loader.resources[data.profile].texture
        );
        this.backgrounds["player" + counter].playerName = data.name;
        counter++;
      }
    });

    for (let bg in this.backgrounds) {
      if (bg.indexOf("player") !== -1) {
        if (counter2 > 0) {
          initialPosition += 180;
        }

        this.backgrounds[bg].position.x = initialPosition;
        this.backgrounds[bg].position.y = 200;
        this.backgrounds[bg].width = 150;
        this.backgrounds[bg].height = 150;
        this.backgrounds[bg].interactive = true;
        this.backgrounds[bg].buttonMode = true;
        this.backgrounds[bg].on("pointerdown", () => {
          if (this.characters.length === 1) {
            this.setupCharacters(this.backgrounds[bg].playerName, true);
            this.setupPowers(true);
            this.setupFatality(true);

            this.battleScene();
          } else {
            this.setupCharacters(this.backgrounds[bg].playerName);
            this.setupPowers();
            this.setupFatality();

            this.scenes.select.removeChild(title);
            title = this.textObj.customText("SELECT PLAYER 2", "center", 520);
            this.scenes.select.addChild(title);
          }
        });

        let playerName = this.textObj.customText(
          this.backgrounds[bg].playerName,
          initialPosition,
          350
        );
        let textPosition = (this.backgrounds[bg].width - playerName.width) / 2;
        playerName.position.x = initialPosition + textPosition;
        this.scenes.select.addChild(this.backgrounds[bg]);
        this.scenes.select.addChild(playerName);
        counter2++;
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
    this.stopSound();
    this.playSound("vs");

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

    setTimeout(() => {
      fightAnim.visible = true;
      fightAnim.play();
      this.playSound("fightScream");
    }, 1000);

    this.scenes.game.addChild(fightAnim);
    this.scenes.game.addChild(this.characterNames[0]);
    this.scenes.game.addChild(this.characterNames[1]);

    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.game.alpha += 0.05;
    };
    animate();
  }

  youWin(winner) {
    this.setActiveScene("youWin");
    let title = this.textObj.customText(
      this.characterNames[winner]._text + " Wins!",
      "center",
      50
    );
    let titleContinue = this.textObj.customText(
      "Press Enter to Restart",
      "center",
      480
    );

    this.scenes.youWin.addChild(title);
    this.scenes.youWin.addChild(titleContinue);
    let animate = () => {
      requestAnimationFrame(animate);
      this.scenes.youWin.alpha += 0.05;
    };
    animate();

    this.stopBgSound();
    this.playSound("welldone");
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
          window.location.reload(false);
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

  setupKeys(character, opponent) {
    this.keys.left = this.keys.left || [];
    this.keys.up = this.keys.up || [];
    this.keys.right = this.keys.right || [];
    this.keys.down = this.keys.down || [];
    this.keys.kick = this.keys.kick || [];
    this.keys.punch = this.keys.punch || [];
    this.keys.pawa = this.keys.pawa || [];
    this.keys.fatal = this.keys.fatal || [];

    let player = opponent ? 1 : 0;

    if (opponent) {
      this.keys.left[player] = Keyboard(37); // left
      this.keys.up[player] = Keyboard(38); // up
      this.keys.right[player] = Keyboard(39); // right
      this.keys.down[player] = Keyboard(40); // down
      this.keys.kick[player] = Keyboard(80); // p
      this.keys.punch[player] = Keyboard(79); // o
      this.keys.pawa[player] = Keyboard(73); // i
      this.keys.fatal[player] = Keyboard(85); // u
    } else {
      this.keys.left[player] = Keyboard(65); // a
      this.keys.up[player] = Keyboard(87); // w
      this.keys.right[player] = Keyboard(68); // d
      this.keys.down[player] = Keyboard(83); // s
      this.keys.kick[player] = Keyboard(70); // f
      this.keys.punch[player] = Keyboard(71); // g
      this.keys.pawa[player] = Keyboard(72); // h
      this.keys.fatal[player] = Keyboard(74); // j
    }

    this.keys.left[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "walk-left";
            character.vx = 3;
            this.checkSide();
          }
        }
      }
    };

    this.keys.left[player].release = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "stance";
            character.vx = 0;
          }
        }
      }
    };

    this.keys.right[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "walk-right";
            character.vx = 3;
            this.checkSide();
          }
        }
      }
    };

    this.keys.right[player].release = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action[player] = "stance";
            character.vx = 0;
          }
        }
      }
    };

    this.keys.down[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.duck) {
          if (character.y === this.groundY) {
            this.action[player] = "ducking";
            character.actions.duck.gotoAndPlay(0);
          }
        }
      }
    };

    this.keys.down[player].release = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.raise) {
          if (character.y === this.groundY) {
            this.action[player] = "raise";
            character.actions.raise.gotoAndPlay(0);
          }
        }
      }
    };

    this.keys.pawa[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.y === this.groundY) {
          if (character.actions.punch) {
            this.action[player] = "punch";
            this.power[player] = "yelo";
            this.powers[player].yelo.gotoAndPlay(0);
            this.powers[player].yelo.visible = true;
            this.powers[player].yelo.y = this.groundY;
            this.powers[player].yelo.x = character.position.x;

            character.actions.punch.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      }
    };

    this.keys.fatal[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.punch) {
          this.action[player] = "punch";
          this.power[player] = "fire";
          this.powers[player].fire.gotoAndPlay(7);
          this.powers[player].fire.visible = true;
          this.powers[player].fire.y = this.groundY;
          this.powers[player].fire.x = character.position.x;

          character.actions.punch.gotoAndPlay(0);

          if (this.scenes.game.visible) {
            this.playSound("nopunch");
            this.playSound("hitscream");
          }
        }
      }
    };

    this.keys.kick[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.kick) {
          if (character.y === this.groundY) {
            this.action[player] = "kick";
            character.actions.kick.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          } else {
            if (!character.actions.airkick) {
              return;
            }

            if (this.action[player] === "jump-right") {
              this.action[player] = "airkick-right";
            } else if (this.action[player] === "jump-left") {
              this.action[player] = "airkick-left";
            } else if (this.action[player] === "jump") {
              this.action[player] = "airkick";
            }

            character.actions.airkick.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      }
    };

    this.keys.punch[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.punch) {
          if (character.y === this.groundY) {
            this.action[player] = "punch";
            character.actions.punch.gotoAndPlay(0);
            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      }
    };

    this.keys.up[player].press = () => {
      if (!this.characters[player].isDeath) {
        if (character.actions.jump) {
          if (character.y === this.groundY) {
            this.action[player] = "jump";
            character.vy = -24;
            this.playSound("jump");
          }
        }
      }
    };
  }

  checkSide() {
    if (!this.switchRight) {
      if (this.characters[1].x < this.characters[0].x) {
        this.characters[1].width = this.characters[1].width * -1;
        this.characters[0].width = this.characters[0].width * -1;
        this.switchRight = true;
        this.switchLeft = false;
      }
    }

    if (!this.switchLeft) {
      if (this.characters[1].x > this.characters[0].x) {
        this.characters[1].width = this.characters[1].width * -1;
        this.characters[0].width = this.characters[0].width * -1;
        this.switchLeft = true;
        this.switchRight = false;
      }
    }
  }

  setupPowers(opponent) {
    const player = opponent ? 0 : 1;

    this.powers[player] = {};

    this.powers[player].yelo = this.createAnimation("yelo-moving", 1);
    this.powers[player].yelo.visible = false;
    this.powers[player].yelo.x = 0;
    this.powers[player].yelo.vx = 15;
    if (player === 1) {
      this.powers[player].yelo.vx = -15;
    }

    this.scenes.game.addChild(this.powers[player].yelo);
  }

  setupFatality(opponent) {
    const player = opponent ? 0 : 1;

    this.powers[player].fire = this.createAnimation("fire0", 7);
    this.powers[player].fire.loop = true;
    this.powers[player].fire.animationSpeed = 0.25;
    this.powers[player].fire.visible = false;
    this.powers[player].fire.x = 0;
    this.powers[player].fire.vx = 15;
    if (player === 1) {
      this.powers[player].fire.vx = -15;
    }

    this.scenes.game.addChild(this.powers[player].fire);
  }

  setupCharacters(selectedPlayer, opponent) {
    const player = opponent ? 1 : 0;

    characterData.characters.forEach(data => {
      if (data.name === selectedPlayer) {
        if (data.active) {
          const character = new PIXI.Container();
          const animations = [];
          const actions = {};

          character.x = opponent ? 770 : 180;
          character.y = this.groundY;
          character.scale.x = opponent ? -data.scale : data.scale;
          character.scale.y = data.scale;

          data.animations.forEach(animation => {
            const sprite = this.createAnimation(
              `${data.name}-${animation.name}`,
              animation.frames
            );
            sprite.name = animation.name;
            sprite.animationSpeed = animation.animationSpeed;
            sprite.anchor.set(0.5, 0);

            if (animation.loop === true) {
              sprite.play();
            } else {
              sprite.loop = false;
            }

            if (animation.loop === "one") {
              sprite.play(1);
            }

            if (!animation.visible) {
              sprite.visible = false;
            }

            animations.push(sprite);
            actions[animation.name] = sprite;
          });

          this.groupSprites(character, animations);

          character.actions = actions;
          character.animations = animations;
          character.opponent = data.opponent;
          character.active = data.active;
          character.isDeath = false;

          this.characters.push(character);

          if (this.characters.length === 1) {
            this.characterNames[0] = this.textObj.customText(
              selectedPlayer,
              53,
              48
            );
          } else {
            this.characterNames[1] = this.textObj.customText(
              selectedPlayer,
              817,
              48
            );
          }

          this.setupKeys(character, opponent);
        }
      }
    });

    this.characters.forEach(character => {
      if (character.active) {
        this.scenes.game.addChild(character);
      }
    });

    this.action[player] = "stance";
  }
}

export default Game;
