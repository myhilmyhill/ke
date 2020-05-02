import { MovingPlayer } from '../character/moving-player';

export class PlayerCollection<TPlayer extends MovingPlayer> {
  private array: TPlayer[];

  constructor(num: number, selector: (index: number) => TPlayer) {
    this.array = Array.from({ length: num }, (_, index) => selector(index));
  }

  *takeEmpties(num: number): Iterator<TPlayer, undefined, TPlayer> {
    let taken = 0;
    for (const item of this.array) {
      if (taken >= num) return;
      if (!item.isVisible) {
        taken++;
        yield item;
      }
    }
  }

  moveAll(): void {
    for (const item of this.array) {
      item.move();
    }
  }

  forEach(
    fn: (item: TPlayer) => void,
    predicateIf?: (item: TPlayer) => boolean,
  ): void {
    for (const item of this.array) {
      if (item.isVisible && (predicateIf?.(item) ?? true)) {
        fn(item);
      }
    }
  }
}
