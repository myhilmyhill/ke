import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import { Coordinate } from '../character/coordinate';
import { PatterningPlayer } from '../character/patterning-player';
import { EnemyPattern } from './enemy-pattern';

export class ActionPattern {
  private static *takeEmptyPlayers<TPlayer extends Player>(
    num: number,
    players: TPlayer[],
  ): Iterator<TPlayer, undefined, TPlayer> {
    let taken = 0;
    for (const player of players) {
      if (taken >= num) return;
      if (!player.isVisible) {
        taken++;
        yield player;
      }
    }
  }

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
    enemies: PatterningPlayer[],
    funcX: (t: number) => number,
    funcY: (t: number) => number,
    pattern: (enemy: PatterningPlayer) => IterableIterator<() => void>,
    screenWidth: number | undefined,
    screenHeight: number | undefined,
  ): IterableIterator<() => void> {
    for (let i = 0; i < num; i++) {
      const showingEnemies = this.takeEmptyPlayers(1, enemies);
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

  static shootRadially(
    from: Player,
    to: Player,
    bullets: MovingPlayer[],
    num: number,
    action: (bullet: MovingPlayer, execute: () => void) => void,
  ): void {
    const showingBullets = this.takeEmptyPlayers(100, bullets);
    for (let i = 0; i < num; i++) {
      showingBullets
        .next()
        .value?.deleteActions()
        ?.addAction((bullet) => {
          bullet.show(from.x, from.y);

          // Set angle
          const r = 5;
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
    targets: Player[],
    action: (target: Player) => void,
  ): () => void {
    return (): void => {
      // Hit enemy
      for (const target of targets) {
        if (
          target.isVisible &&
          bullet.isVisible &&
          Coordinate.isCollided(bullet.hitarea, target.hitarea)
        ) {
          bullet.vanish();
          action(target);
        }
      }
    };
  }
}
