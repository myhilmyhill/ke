import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';

export class BulletShootingPattern {
  static shootZenhoui(
    from: Player,
    to: Player,
    bullets: Iterator<MovingPlayer, undefined, MovingPlayer>,
    num: number,
    action: (bullet: MovingPlayer, execute: () => void) => void,
  ): void {
    for (let i = 0; i < num; i++) {
      bullets.next().value?.setFuncMoving((bullet) => {
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
