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

  introText() {
    let title = this.getTextObject(
      {
        textValue: "Press Enter to start",
        x: "center",
        y: 520,
        vx: 2,
        vy: 0
      },
      this.introStyle()
    );
    return title;
  }

  introStyle() {
    let titleStyle = new PIXI.TextStyle({
      fontFamily: "mk",
      fontSize: 36,
      fill: ["#ff0000", "#444"], // gradient
      wordWrapWidth: 440
    });

    return titleStyle;
  }
}

export default TextStyles;
