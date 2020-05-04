export interface Replay {
  seed: number;
  endTime: number;
  records: ReplayRecord[];
}

export interface ReplayRecord {
  readonly time: number;
  readonly keys: Set<string>;
}
