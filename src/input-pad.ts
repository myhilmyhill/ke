/**
 * keyboard, gamepad
 */
export class InputPad {
  private static keys: {
    [key: string]: {
      isPressed: boolean;
      pressFunc: () => void;
      releaseFunc: () => void;
    };
  } = {};
  private static _pressListener?: (event: KeyboardEvent) => void;
  private static _releaseListener?: (event: KeyboardEvent) => void;

  private static init(): void {
    const pressListener = (event: KeyboardEvent): void => {
      event.preventDefault();
      for (const [key, value] of Object.entries(this.keys)) {
        if (event.key === key && !event.repeat) {
          value.isPressed = true;
          // Do not call pressFunc because the `keydown` event will occur
          // after pressed once then repeat after a wait time.
        }
      }
    };
    const releaseListener = (event: KeyboardEvent): void => {
      event.preventDefault();
      for (const [key, value] of Object.entries(this.keys)) {
        if (event.key === key) {
          value.isPressed = false;
          value.releaseFunc();
        }
      }
    };
    if (this.isUninited()) {
      this._pressListener = pressListener;
      this._releaseListener = releaseListener;
      document.addEventListener('keydown', this._pressListener);
      document.addEventListener('keyup', this._releaseListener);
    }
  }

  public static fire(): void {
    for (const value of Object.values(this.keys)) {
      if (value.isPressed) value.pressFunc();
    }
  }

  private static isUninited(): boolean {
    return (
      this._pressListener === undefined || this._releaseListener === undefined
    );
  }

  static addButton(
    key: string,
    pressFunc: () => void,
    releaseFunc: () => void,
  ): void {
    this.keys[key] = { isPressed: false, pressFunc, releaseFunc };
    if (this.isUninited()) this.init();
  }

  static removeButton(key: string): void {
    delete this.keys[key];
  }

  static removeListener(): void {
    if (!this.isUninited()) {
      document.removeEventListener('keydown', this._pressListener!);
      document.removeEventListener('keyup', this._releaseListener!);
      this._pressListener = undefined;
      this._releaseListener = undefined;
    }
  }
}
