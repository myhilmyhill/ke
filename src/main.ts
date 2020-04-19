export class Main {
  public static run(): void {
    console.log(this.strHello);
  }

  private static get strHello(): string {
    return 'hello';
  }
}
