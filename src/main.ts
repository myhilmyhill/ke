import * as PIXI from 'pixi.js';
import { InputPad } from './input-pad';
import { Player } from './model/character/player';
import { Coordinate } from './model/character/coordinate';

export class Main {
  static vx = 0;
  static vy = 0;
  static screenWidth = 512;
  static screenHeight = 720;
  static isSlow = false;
  static protagonist: Player;
  static bullets: Player[];
  static state: () => void;

  public static run(): void {
    const app = new PIXI.Application({
      width: this.screenWidth,
      height: this.screenHeight,
    });
    document.body.appendChild(app.view);

    this.bullets = Array(1000)
      .fill(null)
      .map(
        () =>
          new Player(
            Math.random() * this.screenWidth,
            Math.random() * this.screenHeight,
            10,
            (x, y, radius, graphics) => {
              graphics.beginFill(0xffffff).drawCircle(x, y, radius).endFill();
              app.stage.addChild(graphics);
            },
          ),
      );
    //Create the `cat` sprite
    this.protagonist = new Player(0, 0, 32, (x, y, radius, graphics) => {
      graphics.beginFill(0xff0000).drawCircle(x, y, radius).endFill();
      app.stage.addChild(graphics);
    });

    InputPad.addButton(
      'Shift',
      (): void => {
        this.isSlow = true;
      },
      (): void => {
        this.isSlow = false;
      },
    );
    InputPad.addButton(
      'ArrowLeft',
      (): void => {
        this.vx = -this.setMovingVelocity();
      },
      (): void => {
        this.vx = 0;
      },
    );
    InputPad.addButton(
      'ArrowUp',
      (): void => {
        this.vy = -this.setMovingVelocity();
      },
      (): void => {
        this.vy = 0;
      },
    );
    InputPad.addButton(
      'ArrowRight',
      (): void => {
        this.vx = this.setMovingVelocity();
      },
      (): void => {
        this.vx = 0;
      },
    );
    InputPad.addButton(
      'ArrowDown',
      (): void => {
        this.vy = this.setMovingVelocity();
      },
      (): void => {
        this.vy = 0;
      },
    );

    //Set the game state
    this.state = this.move;

    //Start the game loop
    app.ticker.add(() => this.gameLoop());
  }

  static resetVelocity(): void {
    this.vx = 0;
    this.vy = 0;
  }

  static setMovingVelocity(): number {
    return this.isSlow ? 3 : 6;
  }

  static determineHit(): void {
    for (const bullet of this.bullets) {
      if (
        bullet.isVisible &&
        Coordinate.isCollided(this.protagonist.hitarea, bullet.hitarea)
      ) {
        bullet.vanish();
        return;
      }
    }
  }

  static gameLoop(): void {
    this.state();
    InputPad.fire();
    this.determineHit();
  }

  static move(): void {
    this.protagonist.x += this.vx;
    this.protagonist.y += this.vy;
  }
}
