var pixi = require("pixi.js");

export function pixiStart() {
    let renderer = PIXI.autoDetectRenderer(800, 800, {backgroundColor : 0x1099bb});

    //Add the canvas to the HTML document
    document.body.appendChild(renderer.view);
    renderer.view.style.border = "1px dashed black";

    //Create a container object called the `stage`
    let stage = new PIXI.Container();

    //Tell the `renderer` to `render` the `stage`
    //renderer.render(stage);
    

   
    // stage.addChild(player);

    
    
    function _runAnimation(functionName) {
      requestAnimationFrame(functionName);
    }

    
    function createPlayer(options) {
      //  "assets/images/characters/test.png"
      let playerTexture = PIXI.Texture.fromImage(options.texture);
      let player = new PIXI.Sprite(playerTexture);
      player.position.x = options.position.x;
      player.position.y = options.position.y;
      player.scale.x = options.scale.x;
      player.scale.y = options.scale.y;
      player.anchor.x = options.anchor.x;
      player.anchor.y = options.anchor.y;
      stage.addChild(player);
      //renderer.render(stage);
      
       
       var animate = function() {
          requestAnimationFrame(animate);
          if (options.rotationSpeed > 0) {
            player.rotation += options.rotationSpeed;
          }
          
          renderer.render(stage);
       }
       animate();
    }

    

    return {
      createPlayer: createPlayer
      
    };
}



  



