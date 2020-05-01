import { Player } from './player';
import { Graphics } from 'pixi.js';

export class MovingPlayer extends Player {
  private _actions: (() => void)[] = [];

  constructor(
    radius: number,
    funcInitial: (
      x: number,
      y: number,
      radius: number,
      graphics: Graphics,
    ) => void,
  ) {
    super(radius, funcInitial);
  }

  public addAction(action: (self: MovingPlayer) => () => void): this {
    this._actions.push(action(this));
    return this;
  }

  public deleteActions(): this {
    this._actions = [];
    return this;
  }

  public move(): void {
    if (this._isVisible) {
      for (const action of this._actions) {
        action();
      }
    }
  }
}
