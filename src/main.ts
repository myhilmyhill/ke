import * as PIXI from 'pixi.js';
import { Field } from './model/field/field';
import { ModesStack } from './model/mode/modes-stack';

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
    ModesStack.init(app, this.screenWidth, this.screenHeight);
  }
}
