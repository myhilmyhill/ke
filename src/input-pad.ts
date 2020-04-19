/**
 * Button on keyboard
 * @see https://github.com/kittykatattack/learningPixi#introduction
 */
export class InputButton {
  private key: InputState;
  private downListener: (event: KeyboardEvent) => void;
  private upListener: (event: KeyboardEvent) => void;

  constructor(value: string) {
    this.key = {
      value: value,
      isDown: false,
      isUp: true,
      press: undefined,
      release: undefined,
    };
    //Attach event listeners
    this.downListener = this.downHandler.bind(this);
    this.upListener = this.upHandler.bind(this);
    window.addEventListener('keydown', this.downListener, false);
    window.addEventListener('keyup', this.upListener, false);
  }

  public get isDown(): boolean {
    return this.key.isDown;
  }

  public get isUp(): boolean {
    return this.key.isUp;
  }

  public set press(value: () => void) {
    this.key.press = value;
  }

  public set release(value: () => void) {
    this.key.release = value;
  }

  public downHandler(event: KeyboardEvent): void {
    if (event.key === this.key.value) {
      if (this.key.isUp && this.key.press) this.key.press();
      this.key.isDown = true;
      this.key.isUp = false;
      event.preventDefault();
    }
  }

  public upHandler(event: KeyboardEvent): void {
    if (event.key === this.key.value) {
      if (this.key.isDown && this.key.release) this.key.release();
      this.key.isDown = false;
      this.key.isUp = true;
      event.preventDefault();
    }
  }

  public unsubscribe(): void {
    window.removeEventListener('keydown', this.downListener);
    window.removeEventListener('keyup', this.upListener);
  }
}

interface InputState {
  value: string;
  isDown: boolean;
  isUp: boolean;
  press?(): void;
  release?(): void;
}
