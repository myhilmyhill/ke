import { Random } from './random';

export class RandomXorshift extends Random {
  private x = 123456789;
  private y = 362436069;
  private z = 521288629;
  private w = 88675123;

  constructor(seed?: number) {
    super();
    if (seed) this.w = seed;
  }

  /** @inheritdoc */
  rand(): number {
    // `>>> 0` means convertion of signed int to unsigned.
    const t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ (this.w >>> 19) ^ (t ^ (t >>> 8))) >>> 0;
    const maxUint32 = 0xffff_ffff >>> 0;
    return this.w / maxUint32;
  }
}
