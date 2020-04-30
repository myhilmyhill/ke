import { Graphics } from 'pixi.js';
import { Circle } from './coordinate';

export class Player {
  protected _hitarea: Circle;
  protected _graphics: Graphics;
  protected _isVisible = true;

  public get hitarea(): Circle {
    return this._hitarea;
  }
  public get x(): number {
    if (!this.isVisible)
      throw Error('Not get coordinates for unvisible player.');
    return this._hitarea.x;
  }
  public set x(value) {
    this._hitarea.x = value;
  }
  public get y(): number {
    if (!this.isVisible)
      throw Error('Not get coordinates for unvisible player.');
    return this._hitarea.y;
  }
  public set y(value) {
    this._hitarea.y = value;
  }
  public get radius(): number {
    return this._hitarea.radius;
  }
  public get isVisible(): boolean {
    return this._isVisible;
  }

  public show(x: number, y: number): this {
    this._isVisible = true;
    this._graphics.visible = true;
    this.x = x;
    this.y = y;
    return this;
  }

  public vanish(): this {
    this._isVisible = false;
    this._graphics.visible = false;
    return this;
  }

  constructor(
    radius: number,
    funcInitial: (
      x: number,
      y: number,
      radius: number,
      graphics: Graphics,
    ) => void,
  ) {
    this._graphics = new Graphics();
    this._hitarea = new Circle({ point: this._graphics.position, radius });
    funcInitial(0, 0, radius, this._graphics);
    this._graphics.position.set(0, 0);
    this.vanish();
  }
}
