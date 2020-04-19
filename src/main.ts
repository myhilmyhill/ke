export class Main {
  public static run(): void {
    console.log(this.strHello);
  }

  public static get strHello(): string {
    return 'hello';
  }
}
