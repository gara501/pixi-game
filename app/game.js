import * as PIXI from "pixi.js";
import * as COLI from "./bump.js";
import * as SOUND from "howler";
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
        "assets/images/characters/aram.json",
        "assets/images/backgrounds/fight.json",
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
    this.introScreen();
    this.setupCharacters();
    this.gameLoop();
  }

  gameLoop() {
    this.app.ticker.add(() => {
      if (!this.scenes.game.visible) return;    
      this.characters.forEach(character => {
        character.animations.forEach(animation => {
          animation.visible = false;
        });
      });

      let collision;

      if (
        this.opponent.actions.hit.visible &&
        this.opponent.actions.hit.currentFrame + 1 ===
          this.opponent.actions.hit.totalFrames
      ) {
        this.opponent.actions.stance.visible = true;
        this.opponent.actions.hit.visible = false;
      }

      if (
        this.opponent.actions.highhit.visible &&
        this.opponent.actions.highhit.currentFrame + 1 ===
          this.opponent.actions.highhit.totalFrames
      ) {
        this.opponent.actions.stance.visible = true;
        this.opponent.actions.highhit.visible = false;
      }

      if (
        this.action === "jump" && this.keys.up.isDown && this.keys.right.isDown
      ) {
        this.action = "jump-right";
        this.characters.forEach(character => {
          if (character.actions.jump) {
            character.actions.jump.gotoAndPlay(0);
            this.playSound("jump");
          }
        });
      }

      if (
        this.action === "jump" && this.keys.up.isDown && this.keys.left.isDown
      ) {
        this.characters.forEach(character => {
          if (character.actions.jump) {
            this.action = "jump-left";
            character.actions.jump.gotoAndPlay(0);
            this.playSound("jump");
          }
        });
      }

      this.utils.update();

      switch (this.action) {
        case "ducking":
          this.characters.forEach(character => {
            if (character.actions.duck) {
              character.actions.duck.visible = true;
            }
          });
          break;
        case "walk-right":
          this.characters.forEach(character => {
            if (character.actions.walk) {
              character.actions.walk.visible = true;

              collision = this.coli.rectangleCollision(
                character,
                this.opponent
              );

              if (!collision || collision === "left") {
                character.position.x += character.vx;
              }
            }
          });
          break;
        case "walk-left":
          this.characters.forEach(character => {
            if (character.actions.walk) {
              character.actions.walk.visible = true;

              collision = this.coli.rectangleCollision(
                character,
                this.opponent
              );

              if (!collision || collision === "right") {
                character.position.x -= character.vx;
              }
            }
          });
          break;
        case "kick":
          this.characters.forEach(character => {
            if (character.actions.kick) {
              character.actions.kick.visible = true;

              if (
                character.actions.kick.currentFrame + 1 ===
                character.actions.kick.totalFrames
              ) {
                this.action = "stance";
              }

              collision = this.coli.rectangleCollision(
                character,
                this.opponent
              );

              if (collision) {
                this.opponent.actions.hit.gotoAndPlay(0);

                this.opponent.actions.stance.visible = false;
                this.opponent.actions.hit.visible = true;

                this.playSound("kick");
                this.playSound("hit");

                this.utils.shake(this.scenes.game, 5);

                this.registerHit();
              }
            }
          });
          break;
        case "punch":
          this.characters.forEach(character => {
            if (character.actions.punch) {
              character.actions.punch.visible = true;

              if (
                character.actions.punch.currentFrame + 1 ===
                character.actions.punch.totalFrames
              ) {
                this.action = "stance";
              }

              collision = this.coli.rectangleCollision(
                character,
                this.opponent
              );

              if (collision) {
                this.opponent.actions.highhit.gotoAndPlay(0);

                this.opponent.actions.stance.visible = false;
                this.opponent.actions.highhit.visible = true;

                this.playSound("punch");
                this.playSound("hit");

                this.utils.shake(this.scenes.game, 0.01, true);

                this.registerHit();
              }
            }
          });
          break;
        case "stance":
          this.characters.forEach(character => {
            if (character.actions.stance) {
              character.actions.stance.visible = true;
            }
          });
          break;
        case "raise":
          this.characters.forEach(character => {
            if (character.actions.raise) {
              character.actions.raise.visible = true;

              if (
                character.actions.raise.currentFrame + 1 ===
                character.actions.raise.totalFrames
              ) {
                this.action = "stance";
              }
            }
          });
          break;
        case "airkick-right":
          this.characters.forEach(character => {
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = this.coli.hit(character, this.opponent);

              if (collision) {
                this.opponent.actions.hit.gotoAndPlay(0);

                if (this.opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");

                  this.utils.shake(this.scenes.game.children[0], 10);

                  this.registerHit();
                }

                this.opponent.actions.stance.visible = false;
                this.opponent.actions.hit.visible = true;
              }

              if (character.y + character.vy <= this.groundY) {
                character.x += character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.right.isDown) {
                  this.action = "walk-right";
                } else {
                  this.action = "stance";
                }
              }
            }
          });
          break;
        case "jump-right":
          this.characters.forEach(character => {
            if (character.actions.jump) {
              character.actions.jump.visible = true;

              character.vy += this.gravity;

              if (character.y + character.vy <= this.groundY) {
                character.x += character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.right.isDown) {
                  this.action = "walk-right";
                } else {
                  this.action = "stance";
                }
              }
            }
          });
          break;

        case "airkick-left":
          this.characters.forEach(character => {
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = this.coli.hit(character, this.opponent);

              if (collision) {
                this.opponent.actions.hit.gotoAndPlay(0);

                if (this.opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");
                  this.registerHit();
                }

                this.opponent.actions.stance.visible = false;
                this.opponent.actions.hit.visible = true;
              }

              if (character.y + character.vy <= this.groundY) {
                character.x -= character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.left.isDown) {
                  this.action = "walk-left";
                } else {
                  this.action = "stance";
                }
              }
            }
          });
          break;

        case "jump-left":
          this.characters.forEach(character => {
            if (character.actions.jump) {
              character.actions.jump.visible = true;

              character.vy += this.gravity;

              if (character.y + character.vy <= this.groundY) {
                character.x -= character.vx * 2.5;
                character.y += character.vy;
              } else {
                character.y = this.groundY;
                if (this.keys.left.isDown) {
                  this.action = "walk-left";
                } else {
                  this.action = "stance";
                }
              }
            }
          });
          break;

        case "airkick":
          this.characters.forEach(character => {
            if (character.actions.airkick) {
              character.actions.airkick.visible = true;

              character.vy += this.gravity;

              collision = this.coli.hit(character, this.opponent);

              if (collision) {
                this.opponent.actions.hit.gotoAndPlay(0);

                if (this.opponent.actions.stance.visible) {
                  this.playSound("kick");
                  this.playSound("hit");
                  this.registerHit();
                }

                this.opponent.actions.stance.visible = false;
                this.opponent.actions.hit.visible = true;
              }

              if (character.y <= this.groundY) {
                character.y += character.vy;
              } else {
                character.y = this.groundY;

                this.action = "stance";
              }
            }
          });
          break;

        case "jump":
          this.characters.forEach(character => {
            if (character.actions.raise) {
              character.actions.staticjump.visible = true;

              character.vy += this.gravity;

              if (character.y <= this.groundY) {
                character.y += character.vy;
              } else {
                character.y = this.groundY;

                this.action = "stance";
              }
            }
          });
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
      this.characters.forEach(character => {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action = "walk-left";
            character.vx = 3;
          }
        }
      });
    };

    this.keys.left.release = () => {
      this.characters.forEach(character => {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action = "stance";
            character.vx = 0;
          }
        }
      });
    };

    this.keys.right.press = () => {
      this.characters.forEach(character => {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action = "walk-right";
            character.vx = 3;
          }
        }
      });
    };

    this.keys.right.release = () => {
      this.characters.forEach(character => {
        if (character.actions.walk) {
          if (character.y === this.groundY) {
            this.action = "stance";
            character.vx = 0;
          }
        }
      });
    };

    this.keys.down.press = () => {
      this.characters.forEach(character => {
        if (character.actions.duck) {
          if (character.y === this.groundY) {
            this.action = "ducking";
            character.actions.duck.gotoAndPlay(0);
          }
        }
      });
    };

    this.keys.down.release = () => {
      this.characters.forEach(character => {
        if (character.actions.raise) {
          if (character.y === this.groundY) {
            this.action = "raise";
            character.actions.raise.gotoAndPlay(0);
          }
        }
      });
    };

    this.keys.j.press = () => {
      this.characters.forEach(character => {
        if (character.actions.kick) {
          if (character.y === this.groundY) {
            this.action = "kick";
            character.actions.kick.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          } else {
            if (!character.actions.airkick) {
              return;
            }

            if (this.action === "jump-right") {
              this.action = "airkick-right";
            } else if (this.action === "jump-left") {
              this.action = "airkick-left";
            } else if (this.action === "jump") {
              this.action = "airkick";
            }

            character.actions.airkick.gotoAndPlay(0);

            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      });
    };

    this.keys.u.press = () => {
      this.characters.forEach(character => {
        if (character.actions.punch) {
          if (character.y === this.groundY) {
            this.action = "punch";
            character.actions.punch.gotoAndPlay(0);
            if (this.scenes.game.visible) {
              this.playSound("nopunch");
              this.playSound("hitscream");
            }
          }
        }
      });
    };

    this.keys.up.press = () => {
      this.characters.forEach(character => {
        if (character.actions.jump) {
          this.action = "jump";
          character.vy = -24;
          this.playSound("jump");
        }
      });
    };
  }

  setupCharacters() {
    this.characters = characterData.characters.map(data => {
      const character = new PIXI.Container();
      const animations = [];
      const actions = {};

      character.x = data.x;
      character.y = this.groundY;
      character.scale.x = data.scale;
      character.scale.y = data.scale;

      data.animations.forEach(animation => {
        const sprite = this.createAnimation(
          `${data.name}-${animation.name}`,
          animation.frames
        );

        sprite.animationSpeed = animation.animationSpeed;

        if (animation.loop) {
          sprite.play();
        } else {
          sprite.loop = false;
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

      return character;
    });

    this.characters.forEach(character => {
      this.scenes.game.addChild(character);
    });

    this.opponent = this.characters.filter(character => character.opponent)[0];
    this.characters = this.characters.filter(character => !character.opponent);

    this.action = "stance";
  }
}

export default Game;
