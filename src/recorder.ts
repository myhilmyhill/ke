import { Replay, ReplayRecord } from './replay';

export class Recorder {
  private seedRandom: number;
  private records: ReplayRecord[] = [];
  private time = 0;
  private currentKeys = new Set<string>();

  constructor(seedRandom: number) {
    this.seedRandom = seedRandom;
  }

  setKey(key: string): void {
    this.currentKeys.add(key);
  }

  isSamePreviousKeys(): boolean {
    // assert(this.time > 0);

    const prev = this.records[this.records.length - 1].keys;
    if (prev.size !== this.currentKeys.size) return false;

    for (const prevKey of prev.values()) {
      if (!this.currentKeys.has(prevKey)) return false;
    }
    return true;
  }

  recordCurrentKeys(): void {
    if (this.time == 0) {
      this.records.push({
        time: this.time,
        keys: new Set<string>(),
      });
    } else if (!this.isSamePreviousKeys()) {
      this.records.push({
        time: this.time,
        keys: this.currentKeys,
      });
    }
    this.time++;
    this.currentKeys = new Set<string>();
  }

  getReplay(): Replay {
    return {
      seed: this.seedRandom,
      endTime: this.time,
      records: Array.from(this.records),
    };
  }
}
