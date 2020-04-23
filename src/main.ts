import * as PIXI from 'pixi.js';
import { Field } from './model/field/field';
import { InputPad } from './input-pad';

export class Main {
  static screenWidth = 512;
  static screenHeight = 720;
  static field: Field;
  static state: () => void;

  public static run(): void {
    const app = new PIXI.Application({
      width: this.screenWidth,
      height: this.screenHeight,
    });
    document.body.appendChild(app.view);
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

    //Start the game loop
    app.ticker.add(() => this.gameLoop());
  }

  static gameLoop(): void {
    InputPad.fire();
    this.field.loop();
  }
}
