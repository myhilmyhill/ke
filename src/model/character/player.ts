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
    return this._hitarea.x;
  }
  public set x(value) {
    this._hitarea.x = value;
  }
  public get y(): number {
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

  public vanish(): void {
    this._isVisible = false;
    this._graphics.visible = false;
  }

  constructor(
    x: number,
    y: number,
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
    this._graphics.position.set(x, y);
  }
}
