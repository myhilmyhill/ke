import { Coordinate } from '../character/coordinate';
import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import * as PIXI from 'pixi.js';
import { ActionPattern } from './action-pattern';
import { PatterningPlayer } from '../character/patterning-player';
import { EnemyPattern } from './enemy-pattern';
import { Life, Viable } from './viable';

const ViableMovingPlayer = Viable(PatterningPlayer);
type ViableMovingPlayer = Life & PatterningPlayer;

export class Field {
  protected protagonist: Player;
  protected enemies: ViableMovingPlayer[];
  protected bullets: MovingPlayer[];
  protected myBullets: MovingPlayer[];

  protected effects: PatterningPlayer[];
  protected enemyPattern: IterableIterator<() => void>;

  protected app: PIXI.Application;
  protected screenHeight: number;
  protected screenWidth: number;
  protected waittimeNextBullet = 0;
  protected vx = 0;
  protected vy = 0;
  protected isSlow = false;

  *pattern(enemy: ViableMovingPlayer): IterableIterator<() => void> {
    enemy.life = 5;
    for (;;) {
      yield (): void =>
        ActionPattern.shootRadially(
          enemy,
          this.protagonist,
          this.bullets,
          10,
          (bullet, execute) => {
            if (
              ActionPattern.isOutOfBound(
                bullet,
                this.screenWidth,
                this.screenHeight,
              )
            ) {
              bullet.vanish();
              return;
            }
            execute();
            this.determineHit(bullet);
          },
        );

      yield* EnemyPattern.wait(20);
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

    this.enemies = Array.from(
      { length: 20 },
      () =>
        new ViableMovingPlayer(30, (x, y, radius, graphics) => {
          graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
          app.stage.addChild(graphics);
        }),
    );

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
          ActionPattern.hitAndVanish(self, this.enemies, (enemy) => {
            const e = enemy as ViableMovingPlayer;
            if (--e.life <= 0) {
              const x = enemy.x;
              const y = enemy.y;
              const radius = enemy.radius;
              const explosion = ActionPattern.takeEmptyPlayers(1, this.effects);
              explosion
                .next()
                .value?.show(0, 0)
                ?.addActionPattern(function* (effect) {
                  yield* EnemyPattern.explode(effect.graphics, x, y, radius);
                  effect.vanish();
                });
              enemy.vanish();
            }
          }),
        ),
    );

    this.protagonist = new Player(32, (x, y, radius, graphics) => {
      graphics.beginFill(0xff0000).drawCircle(x, y, radius).endFill();
      app.stage.addChild(graphics);
    }).show(0, 0);

    this.effects = Array.from(
      { length: 20 },
      () =>
        new PatterningPlayer(0, (_, _1, _2, graphics) => {
          app.stage.addChild(graphics);
          graphics.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        }),
    );

    this.enemyPattern = ActionPattern.moveMultipleAtInterval(
      100,
      30,
      this.enemies,
      (t) => Math.sin(t / 360.0) * 200,
      (t) => -Math.cos(t / 360.0) * 200 + 200,
      (self) => this.pattern(self as ViableMovingPlayer),
      this.screenWidth,
      this.screenHeight,
    );
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
      enemy.move();
    }
    for (const effect of this.effects) {
      effect.move();
    }
    this.waittimeNextBullet -= this.waittimeNextBullet > 0 ? 1 : 0;
    this.enemyPattern.next().value?.();
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
