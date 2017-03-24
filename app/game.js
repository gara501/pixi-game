import * as PIXI from 'pixi.js';
import * as PIXIACTION from 'pixi-action';
import * as SOUND from './sound.js';
import * as COLI from './bump.js';
import TextStyles from './textStyles.js';

class Game {
  constructor() {
    this.app =  new PIXI.Application();
    this.renderer = PIXI.autoDetectRenderer(800, 800, {transparent : true});
    this.loader = PIXI.loader;
    this.resources =  PIXI.loader.resources;
    this.textureCache =  PIXI.utils.TextureCache;
    this.textObj = new TextStyles(this.renderer);

    this.stage = new PIXI.Container();
    this.introScene = new PIXI.Container();
    this.selectScene = new PIXI.Container();
    this.gameScene = new PIXI.Container();
    this.gameOverScene = new PIXI.Container();

    this.stage.addChild(this.introScene);
    this.stage.addChild(this.gameScene);
    this.stage.addChild(this.selectScene);
    this.stage.addChild(this.gameOverScene);


    let initGame = this.initGame();
    this.loader.add('assets/images/backgrounds/armory.json').load(initGame);
    document.body.appendChild(this.renderer.view);


    //this.initGame();
  }

  // Set intro Container, first scene
  initGame() {
    this.introScreen();

  }

  loadSounds() {

  }

  introScreen() {
    this.introScene.visible = true;
    this.selectScene.visible = false;
    this.gameScene.visible = false;
    this.gameOverScene.visible = false;

    let background = PIXI.Sprite.fromImage('assets/images/backgrounds/init.jpg');
    background.position.x = 0;
    background.position.y = 0;
    background.scale.x = 1.5;
    background.scale.y = 1.5;

    this.introScene.addChild(background);

    let welcomeTitle = this.textObj.introText();
    this.introScene.addChild(welcomeTitle);

    let animate = () => {
      requestAnimationFrame(animate);
      this.renderer.render(this.stage);
      PIXI.actionManager.update();
    }
    this.movePlayer({player: welcomeTitle, x: 20, y: 300, time: 4});
    animate();
  }

  gameLoop() {
    requestAnimationFrame(gameLoop);
    //state();
    this.renderer.render(this.stage);
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
      this.stage.addChild(player);
    }

    let animate = () => {
      requestAnimationFrame(animate);
      if (options.rotationSpeed > 0) {
        player.rotation += options.rotationSpeed;
      }

      if (options.vx > 0) {
        player.position.x += options.vx;
      }
      this.renderer.render(this.stage);
      PIXI.actionManager.update();
    }
    animate();
    return player;
  }

  movePlayer(options) {
    let action_move = new PIXI.action.MoveTo(options.x, options.y, options.time);
    let animation = PIXI.actionManager.runAction(options.player, action_move);
  }

  createSpriteSheet(options) {

    let localStage = this.stage;

    let sprite;
    let animationLoop = () => {
      requestAnimationFrame(animationLoop);
      this.renderer.render(localStage);
    }

    let setup = () => {
      localStage.interactive = true;
      let rect = new PIXI.Rectangle(0, 0, 80, 100);
      let texture = PIXI.loader.resources[options.name].texture;
      texture.frame = rect;

      sprite = new PIXI.Sprite(texture);
      let idle = setInterval(function() {
        if (rect.x >= 350) rect.x = 0;
        sprite.texture.frame = rect;
        rect.x += 90;
      }, 300);

      sprite.vx = 30;
      localStage.addChild(sprite);

      animationLoop();
    }

    PIXI.loader.add(options.name, options.source).load(setup);


    window.addEventListener('keydown', function(e) {
      if (e.keyCode == '38') {
      // up arrow
      }
      else if (e.keyCode == '40') {
          // down arrow
      }
      else if (e.keyCode == '37') {
        sprite.x -= sprite.vx;
      }
      else if (e.keyCode == '39') {
        sprite.x += sprite.vx;
      }
      e.preventDefault();
    })
  }

  getNewContainer() {
    return new PIXI.Container();
  }

  getNewParticleContainer() {
    return new PIXI.particles.ParticleContainer();
  }

  groupSprites(container, options) {

    for (let i=0; i < options.length; i++) {
      container.addChild(options[i]);
    }

    this.stage.addChild(container);
    console.log(this.stage);
    this.renderer.render(this.stage);
  }


}

export default Game;
