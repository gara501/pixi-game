import * as PIXI from "pixi.js";

class TextStyles {
  constructor(renderer) {
    this.renderer = renderer;
  }

  getTextObject(options, style) {
    let title = new PIXI.Text(options.textValue, style);
    if (options.x === "center") {
      title.x = this.renderer.width / 2 - title.width / 2;
    } else {
      title.x = options.x;
    }
    if (options.y === "center") {
      title.y = this.renderer.height / 2 - title.height / 2;
    } else {
      title.y = options.y;
    }
    return title;
  }

  customText(value, posx, posy) {
    let title = this.getTextObject(
      {
        textValue: value,
        x: posx,
        y: posy,
        vx: 2,
        vy: 0
      },
      this.generalStyle()
    );
    return title;
  }

  comandsText(value, posx, posy) {
    let title = this.getTextObject(
      {
        textValue: value,
        x: posx,
        y: posy,
        vx: 2,
        vy: 0
      },
      this.basicStyle()
    );
    return title;
  }

  finishText(value, posx, posy, size=64) {
    let title = this.getTextObject(
      {
        textValue: value,
        x: posx,
        y: posy,
        vx: 2,
        vy: 0
      },
      this.generalStyle(size)
    );
    return title;
  }

  generalStyle(fontSizeValue=36) {
    let titleStyle = new PIXI.TextStyle({
      fontFamily: "mk",
      fontSize: fontSizeValue,
      fill: ["#ff0000", "#444"], // gradient
      wordWrapWidth: 440
    });

    return titleStyle;
  }
  
  basicStyle(fontSizeValue=20) {
    let titleStyle = new PIXI.TextStyle({
      fontFamily: "mk",
      fontSize: fontSizeValue,
      fill: ["#fff", "#fff"], // gradient
      wordWrapWidth: 440
    });

    return titleStyle;
  }
  
}

export default TextStyles;
