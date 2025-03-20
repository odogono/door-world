import { beforeEach, describe, expect, test } from 'bun:test';
import {
  PRNG,
  prng,
  prngBoolean,
  prngDouble,
  prngDoubleRange,
  prngInt,
  prngIntRange,
  prngShuffle,
  prngUnsignedInt,
  randomUnsignedInt
} from '../random';

describe('PRNG Class', () => {
  let prngInstance: PRNG;
  const testSeed = 12345;

  beforeEach(() => {
    prngInstance = new PRNG(testSeed);
  });

  test('should initialize with a seed', () => {
    expect(prngInstance.getSeed()).toBe(testSeed);
  });

  test('should generate consistent sequence with same seed', () => {
    const prng1 = new PRNG(testSeed);
    const prng2 = new PRNG(testSeed);

    for (let i = 0; i < 5; i++) {
      expect(prng1.next()).toBe(prng2.next());
    }
  });

  test('nextInt should generate numbers within range', () => {
    const min = 1;
    const max = 10;
    for (let i = 0; i < 100; i++) {
      const value = prngInstance.nextInt(min, max);
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
    }
  });

  test('nextIntRange should generate numbers within range array', () => {
    const range: [number, number] = [1, 10];
    for (let i = 0; i < 100; i++) {
      const value = prngInstance.nextIntRange(range);
      expect(value).toBeGreaterThanOrEqual(range[0]);
      expect(value).toBeLessThanOrEqual(range[1]);
    }
  });

  test('nextFloat should generate numbers within range', () => {
    const min = 0;
    const max = 1;
    for (let i = 0; i < 100; i++) {
      const value = prngInstance.nextFloat(min, max);
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThan(max);
    }
  });

  test('shuffle should maintain array length and elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = prngInstance.shuffle([...original]);

    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });
});

describe('Individual Random Functions', () => {
  const testSeed = 12345;

  test('prng should generate consistent values', () => {
    const value1 = prng(testSeed);
    const value2 = prng(testSeed);
    expect(value1).toBe(value2);
  });

  test('prngInt should return valid tuple', () => {
    const [nextSeed, value] = prngInt(testSeed);
    expect(typeof nextSeed).toBe('number');
    expect(typeof value).toBe('number');
  });

  test('prngUnsignedInt should return positive numbers', () => {
    const [, value] = prngUnsignedInt(testSeed);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(0x7fffffff);
  });

  test('prngDouble should return values between 0 and 1', () => {
    const [, doubles] = Array.from({ length: 100 }).reduce<[number, number[]]>(
      ([seed, acc], _) => {
        const [next, value] = prngDouble(seed);
        acc.push(value);
        return [next, acc];
      },
      [testSeed, []]
    );

    const min = Math.min(...doubles);
    const max = Math.max(...doubles);

    expect(min).toBeGreaterThanOrEqual(0);
    expect(max).toBeLessThanOrEqual(1);
  });

  test('prngBoolean should return boolean values', () => {
    const [, value] = prngBoolean(testSeed);
    expect(typeof value).toBe('boolean');
  });

  test('prngIntRange should return values within range', () => {
    const min = 1;
    const max = 10;
    const [, value] = prngIntRange(testSeed, min, max);

    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });

  test('prngDoubleRange should return values within range', () => {
    const min = 0;
    const max = 1;
    const [, value] = prngDoubleRange(testSeed, min, max);
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
  });

  test('prngShuffle should maintain array elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = prngShuffle(testSeed, [...original]);
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  test('randomUnsignedInt should return values within range', () => {
    const min = 1;
    const max = 10;
    for (let i = 0; i < 100; i++) {
      const value = randomUnsignedInt(min, max);
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
    }
  });
});
