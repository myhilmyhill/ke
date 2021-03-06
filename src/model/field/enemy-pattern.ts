import { Graphics } from 'pixi.js';
import { Player } from '../character/player';

export class EnemyPattern {
  static *wait(time: number): IterableIterator<() => void> {
    for (; time >= 0; time--) {
      yield (): void => undefined;
    }
    return;
  }

  static *once(
    waittime: number,
    action: () => void,
  ): IterableIterator<() => void> {
    for (let waiting = waittime; ; ) {
      if (--waiting > 0) {
        yield (): void => undefined;
      } else {
        yield (): void => action();
        return;
      }
    }
  }

  static *repeat(
    waittime: number,
    action: () => void,
  ): IterableIterator<() => void> {
    for (let waiting = waittime; ; ) {
      if (--waiting > 0) {
        yield (): void => undefined;
      } else {
        yield (): void => action();
        waiting = waittime;
      }
    }
  }

  static *explode(
    effect: Player,
    x: number,
    y: number,
    radius: number,
    func: (graphics: Graphics, radius: number) => void,
  ): IterableIterator<() => void> {
    const g = effect.graphics;
    effect.x = x;
    effect.y = y;
    const maxRadius = radius * 2;
    for (let r = radius / 2; r <= maxRadius; r += 5) {
      /**
       * @see https://gist.github.com/markknol/5c5d48655ebac555a6eec41792acdfb6
       */
      const oval = (
        g: PIXI.Graphics,
        r: number,
        cx: number,
        cy: number,
      ): PIXI.Graphics => {
        const lx = cx - r;
        const rx = cx + r;
        const ty = cy - r;
        const by = cy + r;

        const magic = 0.551915024494;
        const xmagic = magic * r;
        const ymagic = r * magic;

        g.moveTo(cx, ty);
        g.bezierCurveTo(cx + xmagic, ty, rx, cy - ymagic, rx, cy);
        g.bezierCurveTo(rx, cy + ymagic, cx + xmagic, by, cx, by);
        g.bezierCurveTo(cx - xmagic, by, lx, cy + ymagic, lx, cy);
        g.bezierCurveTo(lx, cy - ymagic, cx - xmagic, ty, cx, ty);

        return g;
      };

      effect.hitarea.radius = r;
      g.beginFill(0x0000ff);
      oval(g, maxRadius, 0, 0);
      g.beginHole();
      oval(g, r, 0, 0);
      yield (): void => func(g, r);
      g.clear();
    }
  }
}
