import * as PIXI from 'pixi.js';
import { ModeBase } from './mode-base';
import { InputPad } from '../../input-pad';
import { ModeMain } from './mode-main';
import { ModesStack } from './modes-stack';

export class ModeTitle extends ModeBase {
  protected screenWidth: number;
  protected screenHeight: number;

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
  ) {
    super(app);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    // https://pixijs.io/examples/#/text/text.js
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 36,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ff99'], // gradient
      stroke: '#4a1850',
      strokeThickness: 5,
      dropShadow: true,
      dropShadowColor: '#000000',
      dropShadowBlur: 4,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 6,
      wordWrap: true,
      wordWrapWidth: 440,
    });

    const richText = new PIXI.Text('Press Z to Start', style);
    richText.x = 50;
    richText.y = 250;

    app.stage.addChild(richText);

    InputPad.addButton('z', () => {
      ModesStack.push(() => new ModeMain(app, screenWidth, screenHeight));
    });
    this.init();
  }

  loop(): void {
    InputPad.fire();
  }

  dispose(): void {
    super.dispose();
    this.app.stage.removeChildren();
    InputPad.removeAllButtons();
  }
}
