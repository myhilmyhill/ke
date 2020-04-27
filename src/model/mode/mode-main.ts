import { ModeBase } from './mode-base';
import { Field } from '../field/field';
import { InputPad } from '../../input-pad';
import { ModesStack } from './modes-stack';

export class ModeMain extends ModeBase {
  protected screenWidth: number;
  protected screenHeight: number;
  protected field: Field;

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
  ) {
    super(app);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.field = new Field(app, this.screenWidth, this.screenHeight);

    InputPad.addButton('z', () => this.field.launchBullet());
    InputPad.addButton(
      'Shift',
      (): void => this.field.toggleSlow(true),
      (): void => this.field.toggleSlow(false),
    );
    InputPad.addButton(
      'ArrowLeft',
      (): void => this.field.controlLeft(),
      (): void => this.field.stopX(),
    );
    InputPad.addButton(
      'ArrowUp',
      (): void => this.field.controlUp(),
      (): void => this.field.stopY(),
    );
    InputPad.addButton(
      'ArrowRight',
      (): void => this.field.controlRight(),
      (): void => this.field.stopX(),
    );
    InputPad.addButton(
      'ArrowDown',
      (): void => this.field.controlDown(),
      (): void => this.field.stopY(),
    );
    InputPad.addButton('x', () => {
      ModesStack.pop();
    });
    this.init();
  }

  loop(): void {
    InputPad.fire();
    this.field?.loop();
  }

  dispose(): void {
    super.dispose();
    InputPad.removeAllButtons();
    this.field.dispose();
  }
}
