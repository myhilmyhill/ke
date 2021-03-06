import { ModeBase } from './mode-base';
import { Field } from '../field/field';
import { InputPad } from '../../input-pad';
import { ModesStack } from './modes-stack';
import { Recorder } from '../../recorder';
import { ModeReplay } from './mode-replay';

export class ModeMain extends ModeBase {
  protected screenWidth: number;
  protected screenHeight: number;
  protected field: Field;

  protected seed = Number(new Date());
  protected recorder: Recorder = new Recorder(this.seed);

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
  ) {
    super(app);
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.field = new Field(app, this.screenWidth, this.screenHeight, this.seed);
    InputPad.setRecorder(this.recorder);

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
      ModesStack.push(
        () =>
          new ModeReplay(
            app,
            screenWidth,
            screenHeight,
            this.recorder.getReplay(),
          ),
      );
    });
    this.init();
  }

  loop(): void {
    InputPad.fire();
    this.field?.loop();
    this.recorder.recordCurrentKeys();
  }

  dispose(): void {
    super.dispose();
    InputPad.removeAllButtons();
    this.field.dispose();
  }
}
