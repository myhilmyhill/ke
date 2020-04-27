import { ModeBase } from './mode-base';
import { ModeTitle } from './mode-title';

export class ModesStack {
  static modesPreserve: (() => ModeBase)[] = [];
  static currentMode?: ModeBase;
  static screenWidth: number;
  static screenHeight: number;

  static init(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
  ): void {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.push(() => new ModeTitle(app, screenWidth, screenHeight));
    this.exec();
  }

  private static exec(): void {
    this.currentMode = this.modesPreserve[this.modesPreserve.length - 1]();
  }

  static push(mode: () => ModeBase): void {
    this.currentMode?.dispose();
    this.modesPreserve.push(mode);
    this.exec();
  }

  static pop(): void {
    this.currentMode?.dispose();
    this.modesPreserve.pop();
    this.exec();
  }
}
