import { Main } from '../src/main';

describe('Main procedures', () => {
  test('Prints `hello` in console', () => {
    const str = Main.strHello;
    expect(str).toBe('hello');
  });
});
