import { Player } from './player';
import { Graphics } from 'pixi.js';

export class MovingPlayer extends Player {
  private _funcMoving?: (() => void) | undefined;

  constructor(
    x: number,
    y: number,
    radius: number,
    funcInitial: (
      x: number,
      y: number,
      radius: number,
      graphics: Graphics,
    ) => void,
    funcMoving?: (self: MovingPlayer) => () => void,
  ) {
    super(x, y, radius, funcInitial);
    this.setFuncMoving(funcMoving);
  }

  public setFuncMoving(
    funcMoving: ((self: MovingPlayer) => () => void) | undefined,
  ): void {
    this._funcMoving = funcMoving?.(this);
  }

  public move(): void {
    if (this._isVisible) {
      this._funcMoving?.();
    }
  }
}
