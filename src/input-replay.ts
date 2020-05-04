import { Replay, ReplayRecord } from './replay';

/**
 * replay player
 */
export class InputReplay {
  private keys: {
    [key: string]: {
      isPressed: boolean;
      pressFunc?: () => void;
      releaseFunc?: () => void;
    };
  } = {};
  private records: ReplayRecord[];
  private endTime: number;

  private time = 0;
  private prevKey?: Set<string>;
  private currentKey?: Set<string>;

  constructor(replay: Replay) {
    // Make a shallow copy to apply destructive `shift` operations.
    this.records = Array.from(replay.records);
    this.endTime = replay.endTime;
  }

  public fire(): void {
    if (this.records[0]?.time === this.time) {
      this.prevKey = this.currentKey;
      this.currentKey = this.records.shift()?.keys;
    }

    for (const key of this.prevKey ?? []) {
      if (!this.currentKey?.has(key)) {
        this.keys[key].isPressed = false;
        this.keys[key].releaseFunc?.();
      }
    }

    for (const key of this.currentKey ?? []) {
      this.keys[key].isPressed = true;
      this.keys[key].pressFunc?.();
    }

    this.time++;
  }

  public isOver(): boolean {
    return this.time >= this.endTime;
  }

  addButton(
    key: string,
    pressFunc?: () => void,
    releaseFunc?: () => void,
  ): void {
    this.keys[key] = { isPressed: false, pressFunc, releaseFunc };
  }

  removeButton(key: string): void {
    delete this.keys[key];
  }
}
