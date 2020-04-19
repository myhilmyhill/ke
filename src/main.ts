import * as PIXI from 'pixi.js';
import { InputButton } from './input-pad';

export class Main {
  static vx = 0;
  static vy = 0;
  static protagonist: PIXI.Graphics;
  static state: () => void;

  public static run(): void {
    const app = new PIXI.Application({
      width: 512,
      height: 720,
    });
    document.body.appendChild(app.view);
    const left = new InputButton('ArrowLeft'),
      up = new InputButton('ArrowUp'),
      right = new InputButton('ArrowRight'),
      down = new InputButton('ArrowDown');

    //Create the `cat` sprite
    const protagonist = (this.protagonist = new PIXI.Graphics());
    protagonist.beginFill(0x9966ff);
    protagonist.drawCircle(0, 0, 32);
    protagonist.endFill();
    app.stage.addChild(protagonist);

    //Left arrow key `press` method
    left.press = (): void => {
      //Change the cat's velocity when the key is pressed
      this.vx = -5;
      this.vy = 0;
    };

    //Left arrow key `release` method
    left.release = (): void => {
      //If the left arrow has been released, and the right arrow isn't down,
      //and the cat isn't moving vertically:
      //Stop the cat
      if (!right.isDown && this.vy === 0) {
        this.vx = 0;
      }
    };

    //Up
    up.press = (): void => {
      this.vy = -5;
      this.vx = 0;
    };
    up.release = (): void => {
      if (!down.isDown && this.vx === 0) {
        this.vy = 0;
      }
    };

    //Right
    right.press = (): void => {
      this.vx = 5;
      this.vy = 0;
    };
    right.release = (): void => {
      if (!left.isDown && this.vy === 0) {
        this.vx = 0;
      }
    };

    //Down
    down.press = (): void => {
      this.vy = 5;
      this.vx = 0;
    };
    down.release = (): void => {
      if (!up.isDown && this.vx === 0) {
        this.vy = 0;
      }
    };

    //Set the game state
    this.state = this.move;

    //Start the game loop
    app.ticker.add(() => this.gameLoop());
  }

  static gameLoop(): void {
    this.state();
  }

  static move(): void {
    this.protagonist.x += this.vx;
    this.protagonist.y += this.vy;
  }
}
