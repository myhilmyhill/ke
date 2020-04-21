import * as PIXI from 'pixi.js';
import { InputPad } from './input-pad';
import { Player } from './model/character/player';

export class Main {
  static vx = 0;
  static vy = 0;
  static isSlow = false;
  static protagonist: Player;
  static state: () => void;

  public static run(): void {
    const app = new PIXI.Application({
      width: 512,
      height: 720,
    });
    document.body.appendChild(app.view);

    //Create the `cat` sprite
    this.protagonist = new Player(0, 0, 32, (hitarea, graphics) => {
      graphics.beginFill(0xffffff);
      graphics.drawCircle(hitarea.x, hitarea.y, hitarea.radius);
      graphics.endFill();
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

  static gameLoop(): void {
    this.state();
    InputPad.fire();
  }

  static move(): void {
    this.protagonist.x += this.vx;
    this.protagonist.y += this.vy;
  }
}
