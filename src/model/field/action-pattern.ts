import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import { Coordinate } from '../character/coordinate';

export class ActionPattern {
  private static *takeEmptyPlayers(
    num: number,
    players: MovingPlayer[],
  ): Iterator<MovingPlayer, undefined, MovingPlayer> {
    let taken = 0;
    for (const player of players) {
      if (taken >= num) return;
      if (!player.isVisible) {
        taken++;
        yield player;
      }
    }
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
      if (
        self.x + self.radius <= 0 ||
        self.y + self.radius <= 0 ||
        (screenWidth && self.x - self.radius >= screenWidth) ||
        (screenHeight && self.y - self.radius >= screenHeight)
      ) {
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
