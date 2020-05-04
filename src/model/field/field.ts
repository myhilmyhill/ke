import { Coordinate } from '../character/coordinate';
import { MovingPlayer } from '../character/moving-player';
import { Player } from '../character/player';
import * as PIXI from 'pixi.js';
import { ActionPattern } from './action-pattern';
import { PatterningPlayer } from '../character/patterning-player';
import { EnemyPattern } from './enemy-pattern';
import { Life, Viable } from './viable';
import { PlayerCollection } from '../character/player-collection';
import { Random } from '../calculator/random';
import { RandomXorshift } from '../calculator/random-xorshift';

const ViableMovingPlayer = Viable(PatterningPlayer);
type ViableMovingPlayer = Life & PatterningPlayer;

export class Field {
  protected protagonist: Player;
  protected enemies: PlayerCollection<ViableMovingPlayer>;
  protected bullets: PlayerCollection<MovingPlayer>;
  protected myBullets: PlayerCollection<MovingPlayer>;

  protected effects: PlayerCollection<PatterningPlayer>;
  protected enemyPattern: IterableIterator<(() => void) | undefined>;

  protected app: PIXI.Application;
  protected screenHeight: number;
  protected screenWidth: number;
  protected waittimeNextBullet = 0;
  protected vx = 0;
  protected vy = 0;
  protected isSlow = false;

  protected random: Random;

  *explodeAndEraseBullets(
    x: number,
    y: number,
    radius: number,
    effect: Player,
  ): IterableIterator<() => void> {
    yield* EnemyPattern.explode(effect, x, y, radius, () => {
      this.bullets.forEach(
        (bullet) => bullet.vanish(),
        (bullet) => Coordinate.isCollided(effect.hitarea, bullet.hitarea),
      );
      this.enemies.forEach(
        (enemy) => this.hitEnemy(enemy, 1),
        (enemy) => Coordinate.isCollided(effect.hitarea, enemy.hitarea),
      );
    });
    effect.vanish();
  }

  hitEnemy(enemy: ViableMovingPlayer, damage: number): void {
    enemy.life -= damage;
    if (enemy.life <= 0) {
      const x = enemy.x;
      const y = enemy.y;
      const radius = enemy.radius;
      const explosion = this.effects.takeEmpties(1);
      explosion
        .next()
        .value?.show(0, 0)
        ?.addActionPattern((effect) =>
          this.explodeAndEraseBullets(x, y, radius, effect),
        );
      enemy.vanish();
      ActionPattern.shootBullet(
        this.random.randIntBetween(0, this.screenWidth),
        this.random.randIntBetween(0, this.screenHeight / 2),
        this.random.randBetween(1, 5),
        this.protagonist,
        this.bullets,
      );
    }
  }

  constructor(
    app: PIXI.Application,
    screenWidth: number,
    screenHeight: number,
    seed: number,
  ) {
    this.app = app;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.random = new RandomXorshift(seed);

    this.enemies = new PlayerCollection(
      20,
      () =>
        new ViableMovingPlayer(30, (x, y, radius, graphics) => {
          graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
          app.stage.addChild(graphics);
        }),
    );

    this.bullets = new PlayerCollection(
      1000,
      () =>
        new MovingPlayer(5, (x, y, radius, graphics) => {
          graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
          app.stage.addChild(graphics);
        }),
    );

    this.myBullets = new PlayerCollection(30, () =>
      new MovingPlayer(5, (x, y, radius, graphics) => {
        graphics.beginFill(0x00ff00).drawCircle(x, y, radius).endFill();
        app.stage.addChild(graphics);
      })
        .addAction((self) => ActionPattern.move(self, 0, -10))
        .addAction((self) =>
          ActionPattern.hitAndVanish(self, this.enemies, (enemy) =>
            this.hitEnemy(enemy as ViableMovingPlayer, 1),
          ),
        ),
    );

    this.protagonist = new Player(32, (x, y, radius, graphics) => {
      graphics.beginFill(0xff0000).drawCircle(x, y, radius).endFill();
      app.stage.addChild(graphics);
    }).show(0, 0);

    this.effects = new PlayerCollection(
      20,
      () =>
        new PatterningPlayer(0, (_, _1, _2, graphics) => {
          app.stage.addChild(graphics);
          graphics.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        }),
    );

    this.enemyPattern = function* (
      this: Field,
    ): IterableIterator<(() => void) | undefined> {
      for (;;) {
        for (const i of ActionPattern.moveMultipleAtInterval(
          10,
          30,
          this.enemies,
          (t) => Math.sin(t / 120.0) * 250,
          (t) => -Math.cos(t / 120.0) * 250 + 250,
          (self): IterableIterator<() => void> => {
            (self as ViableMovingPlayer).life = 5;
            return [][Symbol.iterator]();
          },
          this.screenWidth,
          this.screenHeight,
        )) {
          i();
          yield;
        }
        yield* ActionPattern.moveMultipleAtInterval(
          10,
          30,
          this.enemies,
          (t) => this.screenWidth - Math.sin(t / 120.0) * 250,
          (t) => -Math.cos(t / 120.0) * 250 + 250,
          (self): IterableIterator<() => void> => {
            (self as ViableMovingPlayer).life = 5;
            return [][Symbol.iterator]();
          },
          this.screenWidth,
          this.screenHeight,
        );
      }
    }.bind(this)();
  }

  dispose(): void {
    this.app.stage.removeChildren();
  }

  loop(): void {
    this.protagonist.x += this.vx;
    this.protagonist.y += this.vy;
    this.bullets.moveAll();
    this.myBullets.moveAll();
    this.enemies.moveAll();
    this.effects.moveAll();

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

    const shooting = this.myBullets.takeEmpties(2);
    shooting.next().value?.show(this.protagonist.x - 10, this.protagonist.y);
    shooting.next().value?.show(this.protagonist.x + 10, this.protagonist.y);
    this.waittimeNextBullet = 5;
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
