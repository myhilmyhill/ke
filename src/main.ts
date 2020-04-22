import * as PIXI from 'pixi.js';
import { InputPad } from './input-pad';
import { Player } from './model/character/player';
import { Coordinate, Circle } from './model/character/coordinate';
import { MovingPlayer } from './model/character/moving-player';

export class Main {
  static vx = 0;
  static vy = 0;
  static screenWidth = 512;
  static screenHeight = 720;
  static isSlow = false;
  static protagonist: Player;
  static bullets: MovingPlayer[];
  static state: () => void;

  public static run(): void {
    const app = new PIXI.Application({
      width: this.screenWidth,
      height: this.screenHeight,
    });
    document.body.appendChild(app.view);

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
          (circle) => this.moveDiagonallyAndBounce(circle),
        ),
    );
    //Create the `cat` sprite
    this.protagonist = new Player(0, 0, 32, (x, y, radius, graphics) => {
      graphics.beginFill(0xff0000).drawCircle(x, y, radius).endFill();
      app.stage.addChild(graphics);
    });

    InputPad.addButton(
      'z',
      (): void => {
        // Bullets will stop
        this.bullets.forEach((b) => b.setFuncMoving(undefined));
      },
      (): void => {
        // Bullets will move again but does not restore the velocity and direction
        this.bullets.forEach((b) =>
          b.setFuncMoving((circle) => this.moveDiagonallyAndBounce(circle)),
        );
      },
    );
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
        if (this.protagonist.x - this.protagonist.radius <= 0) {
          this.protagonist.x = this.protagonist.radius;
        }
      },
      (): void => {
        this.vx = 0;
      },
    );
    InputPad.addButton(
      'ArrowUp',
      (): void => {
        this.vy = -this.setMovingVelocity();
        if (this.protagonist.y - this.protagonist.radius <= 0) {
          this.protagonist.y = this.protagonist.radius;
        }
      },
      (): void => {
        this.vy = 0;
      },
    );
    InputPad.addButton(
      'ArrowRight',
      (): void => {
        this.vx = this.setMovingVelocity();
        if (this.protagonist.x + this.protagonist.radius >= this.screenWidth) {
          this.protagonist.x = this.screenWidth - this.protagonist.radius;
        }
      },
      (): void => {
        this.vx = 0;
      },
    );
    InputPad.addButton(
      'ArrowDown',
      (): void => {
        this.vy = this.setMovingVelocity();
        if (this.protagonist.y + this.protagonist.radius >= this.screenHeight) {
          this.protagonist.y = this.screenHeight - this.protagonist.radius;
        }
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
    return (this.isSlow ? 3 : 6) / (this.vx * this.vy !== 0 ? 1.41421356 : 1);
  }

  static moveDiagonallyAndBounce(circle: Circle): () => void {
    // Captured variables
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
    };
  }

  static determineHit(): void {
    let isHit = false;
    for (const bullet of this.bullets) {
      bullet.move();

      // Determine the protagonist is hit by bulltes
      if (
        !isHit &&
        bullet.isVisible &&
        Coordinate.isCollided(this.protagonist.hitarea, bullet.hitarea)
      ) {
        isHit = true;
        bullet.vanish();
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
