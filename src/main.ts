import * as PIXI from 'pixi.js';
import { InputPad } from './input-pad';
import { Player } from './model/character/player';

export class Main {
  static vx = 0;
  static vy = 0;
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
      'ArrowLeft',
      (): void => {
        this.vx -= 5;
      },
      (): void => {
        this.vx += 5;
      },
    );
    InputPad.addButton(
      'ArrowUp',
      (): void => {
        this.vy -= 5;
      },
      (): void => {
        this.vy += 5;
      },
    );
    InputPad.addButton(
      'ArrowRight',
      (): void => {
        this.vx += 5;
      },
      (): void => {
        this.vx -= 5;
      },
    );
    InputPad.addButton(
      'ArrowDown',
      (): void => {
        this.vy += 5;
      },
      (): void => {
        this.vy -= 5;
      },
    );

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
