import { ModeBase } from './mode-base';
import { Field } from '../field/field';
import { InputPad } from '../../input-pad';
import { InputReplay } from '../../input-replay';
import { ModesStack } from './modes-stack';
import { Replay } from '../../replay';

export class ModeReplay extends ModeBase {
  protected screenWidth: number;
  protected screenHeight: number;
  protected field: Field;

  protected input: InputReplay;

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
    replay: Replay,
  ) {
    super(app);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.field = new Field(
      app,
      this.screenWidth,
      this.screenHeight,
      replay.seed,
    );

    const input = (this.input = new InputReplay(replay));
    input.addButton('z', () => this.field.launchBullet());
    input.addButton(
      'Shift',
      (): void => this.field.toggleSlow(true),
      (): void => this.field.toggleSlow(false),
    );
    input.addButton(
      'ArrowLeft',
      (): void => this.field.controlLeft(),
      (): void => this.field.stopX(),
    );
    input.addButton(
      'ArrowUp',
      (): void => this.field.controlUp(),
      (): void => this.field.stopY(),
    );
    input.addButton(
      'ArrowRight',
      (): void => this.field.controlRight(),
      (): void => this.field.stopX(),
    );
    input.addButton(
      'ArrowDown',
      (): void => this.field.controlDown(),
      (): void => this.field.stopY(),
    );

    // Abort replaying
    InputPad.addButton('x', () => ModesStack.pop());
    // Save replay
    InputPad.addButton('s', () => console.log(replay));

    this.init();
  }

  loop(): void {
    this.input.fire();
    this.field?.loop();
    if (this.input.isOver()) {
      ModesStack.pop();
    }
  }

  dispose(): void {
    super.dispose();
    InputPad.removeAllButtons();
    this.field.dispose();
  }
}
