export class EnemyPattern {
  static *wait(time: number): IterableIterator<() => void> {
    for (; time >= 0; time--) {
      yield (): void => undefined;
    }
    return;
  }

  static *once(
    waittime: number,
    action: () => void,
  ): IterableIterator<() => void> {
    for (let waiting = waittime; ; ) {
      if (--waiting > 0) {
        yield (): void => undefined;
      } else {
        yield (): void => action();
        return;
      }
    }
  }

  static *repeat(
    waittime: number,
    action: () => void,
  ): IterableIterator<() => void> {
    for (let waiting = waittime; ; ) {
      if (--waiting > 0) {
        yield (): void => undefined;
      } else {
        yield (): void => action();
        waiting = waittime;
      }
    }
  }
}
