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
    InputPad.removeAllButtons();
  }
}
