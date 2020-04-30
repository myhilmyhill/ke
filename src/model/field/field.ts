import { Coordinate } from '../character/coordinate';
import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import * as PIXI from 'pixi.js';
import { ActionPattern } from './action-pattern';
import { PatterningPlayer } from '../character/patterning-player';
import { EnemyPattern } from './enemy-pattern';

export class Field {
  protected protagonist: Player;
  protected enemies: { life: number; player: PatterningPlayer }[];
  protected bullets: MovingPlayer[];
  protected myBullets: MovingPlayer[];

  protected app: PIXI.Application;
  protected screenHeight: number;
  protected screenWidth: number;
  protected waittimeNextBullet = 0;
  protected vx = 0;
  protected vy = 0;
  protected isSlow = false;

  *pattern(enemy: PatterningPlayer): IterableIterator<() => void> {
    const vx = Math.random() * 10;
    for (;;) {
      while (!(enemy.x + enemy.radius >= this.screenWidth)) {
        yield ActionPattern.move(enemy, vx, 0);
      }

      yield* EnemyPattern.wait(20);

      yield (): void =>
        ActionPattern.shootRadially(
          enemy,
          this.protagonist,
          this.bullets,
          10,
          (bullet, execute) => {
            if (this.isOutOfBound(bullet)) {
              bullet.vanish();
              return;
            }
            execute();
            this.determineHit(bullet);
          },
        );

      while (!(enemy.x <= enemy.radius)) {
        yield ActionPattern.move(enemy, -vx, 0);
      }

      yield* EnemyPattern.wait(100);

      yield (): void =>
        ActionPattern.shootRadially(
          enemy,
          this.protagonist,
          this.bullets,
          100,
          (bullet, execute) => {
            if (this.isOutOfBound(bullet)) {
              bullet.vanish();
              return;
            }
            execute();
            this.determineHit(bullet);
          },
        );
    }
  }

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
  ) {
    this.app = app;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.enemies = Array.from({ length: 2 }, (_, i) => ({
      life: 100,
      player: new PatterningPlayer(30, (x, y, radius, graphics) => {
        graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
        app.stage.addChild(graphics);
      })
        .show(200, 100 + 100 * i)
        .addActionPattern((enemy) => this.pattern(enemy)),
    }));

    this.bullets = Array.from(
      { length: 1000 },
      () =>
        new MovingPlayer(5, (x, y, radius, graphics) => {
          graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
          app.stage.addChild(graphics);
        }),
    );

    this.myBullets = Array.from({ length: 30 }, () =>
      new MovingPlayer(5, (x, y, radius, graphics) => {
        graphics.beginFill(0x00ff00).drawCircle(x, y, radius).endFill();
        app.stage.addChild(graphics);
      })
        .addAction((self) => ActionPattern.move(self, 0, -10))
        .addAction((self) =>
          ActionPattern.hitAndVanish(
            self,
            this.enemies.map((i) => i.player),
            (enemy) => {
              const index = this.enemies.findIndex((i) => i.player === enemy);
              if (index > 0) {
                const life = this.enemies[index].life--;
                if (life <= 0) {
                  enemy.vanish();
                }
              }
            },
          ),
        ),
    );

    this.protagonist = new Player(32, (x, y, radius, graphics) => {
      graphics.beginFill(0xff0000).drawCircle(x, y, radius).endFill();
      app.stage.addChild(graphics);
    }).show(0, 0);
  }

  dispose(): void {
    this.app.stage.removeChildren();
  }

  loop(): void {
    this.protagonist.x += this.vx;
    this.protagonist.y += this.vy;
    for (const bullet of this.bullets) {
      bullet.move();
    }
    for (const myBullet of this.myBullets) {
      myBullet.move();
    }
    for (const enemy of this.enemies) {
      enemy.player.move();
    }
    this.waittimeNextBullet -= this.waittimeNextBullet > 0 ? 1 : 0;
  }

  determineHit(bullet: Player): void {
    // Determine the protagonist is hit by bulltes
    if (
      bullet.isVisible &&
      Coordinate.isCollided(this.protagonist.hitarea, bullet.hitarea)
    ) {
      bullet.vanish();
    }
  }

  isOutOfBound(self: Player): boolean {
    return (
      self.x < -self.radius ||
      self.y < -self.radius ||
      self.x - self.radius > this.screenWidth ||
      self.y - self.radius > this.screenHeight
    );
  }

  // Controll the protagonist

  launchBullet(): void {
    if (this.waittimeNextBullet > 0) return;

    let single = false;
    for (const myBullet of this.myBullets) {
      if (myBullet.isVisible) continue;
      myBullet.show(
        this.protagonist.x + (single ? 10 : -10),
        this.protagonist.y,
      );
      if (single) return;
      single = true;
      this.waittimeNextBullet = 5;
    }
  }

  setMovingVelocity(): number {
    return (this.isSlow ? 3 : 6) / (this.vx * this.vy !== 0 ? 1.41421356 : 1);
  }

  controlLeft(): void {
    this.vx = -this.setMovingVelocity();
    if (this.protagonist.x - this.protagonist.radius <= 0) {
      this.protagonist.x = this.protagonist.radius;
    }
  }

  controlUp(): void {
    this.vy = -this.setMovingVelocity();
    if (this.protagonist.y - this.protagonist.radius <= 0) {
      this.protagonist.y = this.protagonist.radius;
    }
  }

  controlRight(): void {
    this.vx = this.setMovingVelocity();
    if (this.protagonist.x + this.protagonist.radius >= this.screenWidth) {
      this.protagonist.x = this.screenWidth - this.protagonist.radius;
    }
  }

  controlDown(): void {
    this.vy = this.setMovingVelocity();
    if (this.protagonist.y + this.protagonist.radius >= this.screenHeight) {
      this.protagonist.y = this.screenHeight - this.protagonist.radius;
    }
  }

  stopX(): void {
    this.vx = 0;
  }

  stopY(): void {
    this.vy = 0;
  }

  toggleSlow(enable: boolean): void {
    this.isSlow = enable;
  }
}
