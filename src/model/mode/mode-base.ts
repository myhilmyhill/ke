export abstract class ModeBase {
  protected app: PIXI.Application;
  protected loopBinded: () => void;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.loopBinded = this.loop.bind(this);
  }

  abstract loop(): void;

  init(): void {
    this.app.ticker.add(this.loopBinded);
  }

  dispose(): void {
    this.app.ticker.remove(this.loopBinded);
  }
}
