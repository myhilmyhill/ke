import { Circle, Graphics } from 'pixi.js';

export class Player {
  private _hitarea: Circle;
  private _graphics: Graphics;
  public get x(): number {
    return this._hitarea.x;
  }
  public set x(value) {
    this._hitarea.x = this._graphics.x = value;
  }
  public get y(): number {
    return this._hitarea.y;
  }
  public set y(value) {
    this._hitarea.y = this._graphics.y = value;
  }

  constructor(
    x: number,
    y: number,
    radius: number,
    funcInitial: (hitarea: Circle, graphics: Graphics) => void,
  ) {
    this._hitarea = new Circle(x, y, radius);
    this._graphics = new Graphics();
    funcInitial(this._hitarea, this._graphics);
  }
}
