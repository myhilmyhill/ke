import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';

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

  static moveY(self: MovingPlayer, y: number): () => void {
    return (): void => {
      self.y += y;
      if (self.y < -self.radius) {
        self.vanish();
      }
    };
  }

  static moveAndBounceX(
    self: MovingPlayer,
    x: number,
    screenWidth: number,
  ): () => void {
    return (): void => {
      self.x += x;
      if (self.x + self.radius >= screenWidth) {
        self.x = screenWidth - self.radius;
        x *= -1;
      } else if (self.x <= self.radius) {
        self.x = self.radius;
        x *= -1;
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
        .addAction((bullet) => {
          bullet.x = from.x;
          bullet.y = from.y;
          bullet.show();

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
}
