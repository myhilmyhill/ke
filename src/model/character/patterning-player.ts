import { Graphics } from 'pixi.js';
import { MovingPlayer } from './moving-player';

export class PatterningPlayer extends MovingPlayer {
  private pattern?: IterableIterator<() => void>;

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

  public addActionPattern(
    pattern: (enemy: PatterningPlayer) => IterableIterator<() => void>,
  ): this {
    this.pattern = pattern(this);
    return this;
  }

  public deleteActionPattern(): this {
    this.pattern = undefined;
    return this;
  }

  public move(): void {
    super.move();
    if (this._isVisible) {
      this.pattern?.next().value?.();
    }
  }
}
