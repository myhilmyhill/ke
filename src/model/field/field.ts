import { Coordinate } from '../character/coordinate';
import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import * as PIXI from 'pixi.js';

export class Field {
  protected protagonist: Player;
  protected enemies: { life: number; player: MovingPlayer }[];
  protected bullets: MovingPlayer[];
  protected myBullets: MovingPlayer[];

  protected screenHeight: number;
  protected screenWidth: number;
  protected waittimeNextBullet = 0;
  protected vx = 0;
  protected vy = 0;
  protected isSlow = false;

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
  ) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;

    this.enemies = Array.from({ length: 2 }, (_, i) => ({
      life: 100,
      player: new MovingPlayer(
        200,
        100 + 100 * i,
        30,
        (x, y, radius, graphics) => {
          graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
          app.stage.addChild(graphics);
        },
      ),
    }));
    this.bullets = Array.from(
      { length: 1000 },
      () =>
        new MovingPlayer(
          Math.random() * this.screenWidth,
          Math.random() * this.screenHeight,
          10,
          (x, y, radius, graphics) => {
            graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
            app.stage.addChild(graphics);
          },
          (self) => this.moveDiagonallyAndBounce(self),
        ),
    );
    this.myBullets = Array.from(
      { length: 30 },
      () =>
        new MovingPlayer(
          0,
          0,
          5,
          (x, y, radius, graphics) => {
            graphics.beginFill(0x00ff00).drawCircle(x, y, radius).endFill();
            app.stage.addChild(graphics);
            graphics.visible = false;
          },
          (self) => (): void => {
            self.y -= 10;
            if (self.y < -self.radius) {
              self.vanish();
            }

            // Hit enemy
            for (const bullet of this.bullets) {
              if (
                bullet.isVisible &&
                self.isVisible &&
                Coordinate.isCollided(self.hitarea, bullet.hitarea)
              ) {
                bullet.vanish();
                self.vanish();
              }
            }

            for (const enemy of this.enemies) {
              if (
                enemy.player.isVisible &&
                self.isVisible &&
                Coordinate.isCollided(self.hitarea, enemy.player.hitarea)
              ) {
                self.vanish();
                if (--enemy.life <= 0) {
                  enemy.player.vanish();
                }
              }
            }
          },
        ),
    );

    this.protagonist = new Player(0, 0, 32, (x, y, radius, graphics) => {
      graphics.beginFill(0xff0000).drawCircle(x, y, radius).endFill();
      app.stage.addChild(graphics);
    });
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
    this.waittimeNextBullet -= this.waittimeNextBullet > 0 ? 1 : 0;
  }

  moveDiagonallyAndBounce(self: MovingPlayer): () => void {
    // Captured variables
    const circle = self.hitarea;
    let vx = Math.random() + 1;
    let vy = Math.random();

    const invert = (): void => {
      if (this.screenWidth <= circle.x + circle.radius) {
        circle.x = this.screenWidth - circle.radius;
        vx *= -1;
      } else if (circle.x - circle.radius <= 0) {
        circle.x = circle.radius;
        vx *= -1;
      }
      if (this.screenHeight <= circle.y + circle.radius) {
        circle.y = this.screenHeight - circle.radius;
        vy *= -1;
      } else if (circle.y - circle.radius <= 0) {
        circle.y = circle.radius;
        vy *= -1;
      }
    };
    return (): void => {
      circle.x += vx;
      circle.y += vy;
      invert();
      this.determineHit(self);
    };
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

  // Controll the protagonist

  launchBullet(): void {
    if (this.waittimeNextBullet > 0) return;

    let single = false;
    for (const myBullet of this.myBullets) {
      if (myBullet.isVisible) continue;
      myBullet.show();
      myBullet.x = this.protagonist.x + (single ? 10 : -10);
      myBullet.y = this.protagonist.y;
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
