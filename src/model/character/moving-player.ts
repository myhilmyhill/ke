import { Player } from './player';
import { Graphics } from 'pixi.js';
import { Circle } from './coordinate';

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
    funcMoving?: (hitarea: Circle) => () => void,
  ) {
    super(x, y, radius, funcInitial);
    this.setFuncMoving(funcMoving);
  }

  public setFuncMoving(
    funcMoving: ((hitarea: Circle) => () => void) | undefined,
  ): void {
    this._funcMoving = funcMoving?.(this._hitarea);
  }

  public move(): void {
    if (this._isVisible) {
      this._funcMoving?.();
    }
  }
}
