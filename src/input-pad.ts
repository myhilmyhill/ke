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
    if (this._pressListener === undefined) {
      this._pressListener = pressListener;
      document.addEventListener('keydown', this._pressListener);
    }
    if (this._releaseListener === undefined) {
      this._releaseListener = releaseListener;
      document.addEventListener('keyup', this._releaseListener);
    }
  }

  public static fire(): void {
    for (const value of Object.values(this.keys)) {
      if (value.isPressed) value.pressFunc();
    }
  }

  static addButton(
    key: string,
    pressFunc: () => void,
    releaseFunc: () => void,
  ): void {
    this.keys[key] = { isPressed: false, pressFunc, releaseFunc };
    if (
      this._pressListener === undefined ||
      this._releaseListener === undefined
    ) {
      this.init();
    }
  }

  static removeButton(key: string): void {
    delete this.keys[key];
  }

  static removeListener(): void {
    if (this._pressListener !== undefined) {
      document.removeEventListener('keydown', this._pressListener);
      this._pressListener = undefined;
    }
    if (this._releaseListener !== undefined) {
      document.removeEventListener('keyup', this._releaseListener);
      this._releaseListener = undefined;
    }
  }
}
