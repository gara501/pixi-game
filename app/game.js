import * as PIXI from "pixi.js";
import * as PIXIACTION from "pixi-action";
import * as SOUND from "./sound.js";
import * as COLI from "./bump.js";
import TextStyles from "./textStyles.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(1000, 600, {backgroundColor : 0x000000});
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
        "assets/images/characters/p1.png",
        "assets/images/characters/p2.png",
        "assets/images/characters/p3.jpg"
      ])
      .load(() => {
        this.initGame();
      });
    document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  // Set intro Container, first scene
  initGame() {
    this.introScreen();
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

    const scorpion = this.createAnimation("scorpion-stance-left-", 9);
    const scorpion2 = this.createAnimation("scorpion-stance2-left-", 9);

    scorpion.x = this.app.renderer.width / 3;
    scorpion2.x = this.app.renderer.width / 2;

    scorpion.y = this.app.renderer.height / 2;
    scorpion2.y = this.app.renderer.height / 2;

    scorpion.animationSpeed = 0.16;
    scorpion2.animationSpeed = 0.16;

    scorpion.play();
    scorpion2.play();

    this.introScene.addChild(scorpion);
    this.introScene.addChild(scorpion2);
  }

  chooseScreen() {
    this.introScene.visible = false;
    this.gameScene.visible = false;
    this.gameOverScene.visible = false;
    this.selectScene.visible = true;

    this.backgrounds.player1 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p1.png"].texture
    );
    this.backgrounds.player2 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p2.png"].texture
    );
    this.backgrounds.player3 = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/characters/p3.jpg"].texture
    );

    this.backgrounds.player1.position.x = 0;
    this.backgrounds.player1.position.y = 0;
    this.backgrounds.player1.width = 320;
    this.backgrounds.player1.height = 320;
    
    this.backgrounds.player2.position.x = 600;
    this.backgrounds.player2.position.y = 200;
    this.backgrounds.player2.width = 320;
    this.backgrounds.player2.height = 320;

    this.backgrounds.player3.position.x = 1000;
    this.backgrounds.player3.position.y = 200;
    this.backgrounds.player3.width = 320;
    this.backgrounds.player3.height = 320;

    
    this.player1 = this.backgrounds.player1;
    this.player2 = this.backgrounds.player2;
    this.player3 = this.backgrounds.player3;

    this.setBGScale(this.background);

    this.selectScene.addChild(this.background);
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

  getNewContainer() {
    return new PIXI.Container();
  }

  getNewParticleContainer() {
    return new PIXI.particles.ParticleContainer();
  }

  groupSprites(container, options) {
    for (let i = 0; i < options.length; i++) {
      container.addChild(options[i]);
    }

    this.app.stage.addChild(container);
    console.log(this.app.stage);
    this.renderer.render(this.app.stage);
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
        if (e.key === 'Enter') {
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

  createAnimation(id, numberFrames) {
    let frames = [];

    for (let i = 1; i <= numberFrames; i++) {
      frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
    }

    const anim = new PIXI.extras.AnimatedSprite(frames);

    return anim;
  }
}

export default Game;
