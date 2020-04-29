import { Graphics } from 'pixi.js';
import { MovingPlayer } from './moving-player';

export class PatterningPlayer extends MovingPlayer {
  private pattern?: IterableIterator<() => void>;

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
  ) {
    super(x, y, radius, funcInitial);
  }

  public addActionPattern(
    pattern: (enemy: PatterningPlayer) => IterableIterator<() => void>,
  ): PatterningPlayer {
    this.pattern = pattern(this);
    return this;
  }

  public move(): void {
    if (this._isVisible) {
      this.pattern?.next().value?.();
    }
  }
}
