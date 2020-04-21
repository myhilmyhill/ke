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
  private static _pressListener: (event: KeyboardEvent) => void;
  private static _releaseListener: (event: KeyboardEvent) => void;

  private static init(): void {
    const pressListener = (event: KeyboardEvent): void => {
      event.preventDefault();
      for (const [key, value] of Object.entries(this.keys)) {
        if (event.key === key && !value.isPressed) {
          value.isPressed = true;
          value.pressFunc();
        }
      }
    };
    const releaseListener = (event: KeyboardEvent): void => {
      event.preventDefault();
      for (const [key, value] of Object.entries(this.keys)) {
        if (event.key === key && value.isPressed) {
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

  private static isUninited(): boolean {
    return (
      this._pressListener === undefined && this._releaseListener === undefined
    );
  }

  static addButton(
    key: string,
    pressFunc: () => void,
    releaseFunc: () => void,
  ): void {
    this.keys[key] = { isPressed: false, pressFunc, releaseFunc };
    console.log(`${this.isUninited()}`);
    if (this.isUninited()) this.init();
  }

  static removeButton(key: string): void {
    delete this.keys[key];
  }
}
