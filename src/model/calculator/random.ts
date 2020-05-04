export abstract class Random {
  /**
   * @returns a float number in the range 0 to less than 1.
   */
  abstract rand(): number;

  /**
   * @param min integer that a random value is greater than and equal to.
   * @param max integer that a random value is less than.
   * @returns a random integer between [min, max).
   */
  randIntBetween(min: number, max: number): number {
    return Math.floor(this.rand() * Math.floor(max - min)) + min;
  }

  /**
   * @returns a random float number between [min, max).
   */
  randBetween(min: number, max: number): number {
    return this.rand() * (max - min) + min;
  }
}
