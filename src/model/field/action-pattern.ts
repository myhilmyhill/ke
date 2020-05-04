import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import { Coordinate } from '../character/coordinate';
import { PatterningPlayer } from '../character/patterning-player';
import { EnemyPattern } from './enemy-pattern';
import { PlayerCollection } from '../character/player-collection';

export class ActionPattern {
  private static moveByFunction(
    self: Player,
    funcX: (t: number) => number,
    funcY: (t: number) => number,
    screenWidth?: number,
    screenHeight?: number,
  ): () => void {
    let t = 0;
    return (): void => {
      if (this.isOutOfBound(self, screenWidth, screenHeight)) {
        self.vanish();
        return;
      }
      self.x = funcX(t);
      self.y = funcY(t);
      t++;
    };
  }

  static *moveMultipleAtInterval(
    num: number,
    interval: number,
    enemies: PlayerCollection<PatterningPlayer>,
    funcX: (t: number) => number,
    funcY: (t: number) => number,
    pattern: (enemy: PatterningPlayer) => IterableIterator<() => void>,
    screenWidth: number | undefined,
    screenHeight: number | undefined,
  ): IterableIterator<() => void> {
    for (let i = 0; i < num; i++) {
      const showingEnemies = enemies.takeEmpties(1);
      showingEnemies
        .next()
        .value?.show(funcX(0), funcY(0))
        .deleteActions()
        .addAction((enemy) =>
          this.moveByFunction(enemy, funcX, funcY, screenWidth, screenHeight),
        )
        .addActionPattern((enemy) => pattern(enemy));

      yield* EnemyPattern.wait(interval);
    }
    return;
  }

  static isOutOfBound(
    self: Player,
    screenWidth: number | undefined,
    screenHeight: number | undefined,
  ): boolean {
    return (
      self.x + self.radius <= 0 ||
      self.y + self.radius <= 0 ||
      (screenWidth !== undefined && self.x - self.radius >= screenWidth) ||
      (screenHeight !== undefined && self.y - self.radius >= screenHeight)
    );
  }

  static move(
    self: MovingPlayer,
    x: number,
    y: number,
    screenWidth?: number,
    screenHeight?: number,
  ): () => void {
    return (): void => {
      self.x += x;
      self.y += y;
      if (this.isOutOfBound(self, screenWidth, screenHeight)) {
        self.vanish();
      }
    };
  }

  static shootBullet(
    x: number,
    y: number,
    speed: number,
    to: Player,
    bullets: PlayerCollection<MovingPlayer>,
    action?: (bullet: MovingPlayer, execute: () => void) => void,
  ): void {
    const showingBullets = bullets.takeEmpties(1);
    showingBullets
      .next()
      .value?.deleteActions()
      ?.addAction((bullet) => {
        bullet.show(x, y);

        // Set angle
        const t = Math.atan2(to.y - y, to.x - x);
        const vx = Math.cos(t) * speed;
        const vy = Math.sin(t) * speed;
        const funcExecution = (): void => {
          bullet.x += vx;
          bullet.y += vy;
        };
        return (): void => {
          action !== undefined
            ? action(bullet, funcExecution)
            : funcExecution();
        };
      });
  }

  static shootRadially(
    from: Player,
    to: Player,
    bullets: PlayerCollection<MovingPlayer>,
    num: number,
    action: (bullet: MovingPlayer, execute: () => void) => void,
  ): void {
    const showingBullets = bullets.takeEmpties(100);
    for (let i = 0; i < num; i++) {
      showingBullets
        .next()
        .value?.deleteActions()
        ?.addAction((bullet) => {
          bullet.show(from.x, from.y);

          // Set angle
          const r = 0.5;
          const t =
            Math.atan2(to.y - from.y, to.x - from.x) + (i * Math.PI * 2) / num;
          const vx = Math.cos(t) * r;
          const vy = Math.sin(t) * r;
          const funcExecution = (): void => {
            bullet.x += vx;
            bullet.y += vy;
          };
          return (): void => {
            action(bullet, funcExecution);
          };
        });
    }
  }

  static hitAndVanish(
    bullet: Player,
    targets: PlayerCollection<MovingPlayer>,
    action: (target: Player) => void,
  ): () => void {
    return (): void => {
      targets.forEach(
        (target) => {
          bullet.vanish();
          action(target);
        },
        (target) =>
          bullet.isVisible &&
          Coordinate.isCollided(bullet.hitarea, target.hitarea),
      );
    };
  }
}
