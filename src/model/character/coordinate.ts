import { IPoint } from 'pixi.js';

export class Coordinate {
  static getDistanceSquare(x: number, y: number): number {
    return x ** 2 + y ** 2;
  }

  static isCollided(p1: Circle, p2: Circle): boolean {
    return (
      this.getDistanceSquare(p2.x - p1.x, p2.y - p1.y) <
      (p1.radius + p2.radius) ** 2
    );
  }
}

/**
 * Not using PIXI.Circle
 */
export class Circle {
  protected _area: { point: IPoint; radius: number };
  constructor(area: { point: IPoint; radius: number }) {
    this._area = area;
  }
  public get x(): number {
    return this._area.point.x;
  }
  public set x(value) {
    this._area.point.x = value;
  }
  public get y(): number {
    return this._area.point.y;
  }
  public set y(value) {
    this._area.point.y = value;
  }
  public get radius(): number {
    return this._area.radius;
  }
  public set radius(value) {
    this._area.radius = value;
  }
}
