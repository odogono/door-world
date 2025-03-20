import { describe, expect, test } from 'bun:test';
import {
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

describe('PRNG Random Functions', () => {
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
    const [, shuffled] = prngShuffle(testSeed, [...original]);
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
