import * as PIXI from "pixi.js";
import * as PIXIACTION from "pixi-action";
import * as SOUND from "./sound.js";
import * as COLI from "./bump.js";
import TextStyles from "./textStyles.js";

class Game {
  constructor() {
    this.app = new PIXI.Application(window.innerWidth, window.innerHeight);
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
        "assets/images/backgrounds/armory.json",
        "assets/images/backgrounds/intro.png"
      ])
      .load(() => {
        this.initGame();
      });

    document.body.appendChild(this.app.renderer.view);
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

    this.background = this.backgrounds.intro;
    this.setBGScale(this.background);

    this.introScene.addChild(this.background);

    let welcomeTitle = this.textObj.introText();
    this.introScene.addChild(welcomeTitle);

    let animate = () => {
      requestAnimationFrame(animate);
      this.app.renderer.render(this.app.stage);
      PIXI.actionManager.update();
    };
    this.movePlayer({ player: welcomeTitle, x: 20, y: 300, time: 4 });
    animate();
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
    const winAspectRatio = window.innerWidth / window.innerHeight;
    const bgAspectRatio = sprite.texture.width / sprite.texture.height;
    let ratio;

    if (winAspectRatio > bgAspectRatio) {
      ratio = window.innerWidth / sprite.texture.width;
    } else {
      ratio = window.innerHeight / sprite.texture.height;
    }

    sprite.scale.x = ratio;
    sprite.scale.y = ratio;

    sprite.position.x = (window.innerWidth - sprite.width) / 2;
    sprite.position.y = (window.innerHeight - sprite.height) / 2;
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
      this.requestFullscreen();
    });

    window.addEventListener("resize", e => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight);
      this.setBGScale(this.background);
    });
  }
}

export default Game;
