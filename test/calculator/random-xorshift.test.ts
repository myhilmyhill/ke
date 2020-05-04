import { RandomXorshift } from '../../src/model/calculator/random-xorshift';

describe('Random calculator by Xorshift', () => {
  test('Returns reproductibly', () => {
    const seed = 12321;
    const first = new RandomXorshift(seed);
    const valuesFirst = Array.from({ length: 10000 }, () => first.rand());
    const second = new RandomXorshift(seed);
    const valuesSecond = Array.from({ length: 10000 }, () => second.rand());
    expect(valuesFirst).toEqual(valuesSecond);
  });

  test('Returns uniformly', () => {
    for (let i = 1; i <= 10; i++) {
      const random = new RandomXorshift(i);
      const values = Array.from({ length: 10000 }, () => random.rand());
      const sum = values.reduce((prev, cur) => prev + cur, 0);
      const mean = sum / values.length;
      expect(mean).toBeGreaterThan(0.49);
      expect(mean).toBeLessThan(0.51);
      console.log(`#${i} mean: ${mean}`);
    }
  });

  test('Returns uniquely', () => {
    const random = new RandomXorshift();
    for (let i = 0, first = random.rand(); i < 10000; i++) {
      expect(random.rand()).not.toEqual(first);
    }
  });

  test('Returns between 0 and 1', () => {
    const random = new RandomXorshift();
    const values = Array.from({ length: 10000 }, () => random.rand());
    const min = Math.min(...values);
    const max = Math.max(...values);
    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThan(1);
    console.log(`min: ${min}\nmax: ${max}`);
  });

  test('Returns floats in range', () => {
    const random = new RandomXorshift();
    const expectMin = -100;
    const expectMax = 100;
    const values = Array.from({ length: 10000 }, () =>
      random.randBetween(expectMin, expectMax),
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    expect(min).toBeGreaterThanOrEqual(expectMin);
    expect(max).toBeLessThan(expectMax);
  });

  test('`randIntBetween` returns integer', () => {
    const random = new RandomXorshift();
    const expectMin = -100000;
    const expectMax = 100000;
    const values = Array.from({ length: 10000 }, () =>
      random.randIntBetween(expectMin, expectMax),
    );
    values.forEach((item) => expect(item).toEqual(Math.floor(item)));
  });

  test('Returns integers in range', () => {
    const random = new RandomXorshift();
    const expectMin = -100;
    const expectMax = 100;
    const values = Array.from({ length: 10000 }, () =>
      random.randIntBetween(expectMin, expectMax),
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    expect(min).toBeGreaterThanOrEqual(expectMin);
    expect(max).toBeLessThan(expectMax);
  });
});
