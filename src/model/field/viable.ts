// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = {}> = new (...args: any[]) => T;

export interface Life {
  life: number;
}

export const Viable = <T extends Constructor>(Base: T): Constructor<Life> & T =>
  class extends Base {
    public life = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
    }
  };
