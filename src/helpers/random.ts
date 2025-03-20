export const prng = (seed: number) => (seed * 16807) % 2147483647;

/**
 * provides the next psuedo-random number as
 * an unsigned integer (31 bits)
 * @param seed
 * @returns
 */
export const prngInt = (seed: number) => {
  const next = prng(seed);
  return [next, next];
};

/**
 * Returns a tuple of [seed, unsigned integer (31 bits)]
 */
export const prngUnsignedInt = (seed: number) => {
  const [next, value] = prngInt(seed);
  return [next, value & 0x7fffffff];
};

/**
 * Returns a tuple of [seed, float between nearly 0 and nearly 1]
 */
export const prngDouble = (seed: number) => {
  const next = prng(seed);
  return [next, seed / 2147483647];
};

export const prngBoolean = (seed: number) => {
  const next = prng(seed);
  return [next, next % 2 === 0];
};

export const prngIntRange = (seed: number, min: number, max: number) => {
  const [next, double] = prngDouble(seed);
  return [next, Math.round(min + (max - min) * double)];
};

export const prngDoubleRange = (seed: number, min: number, max: number) => {
  const [next, double] = prngDouble(seed);
  return [next, min + (max - min) * double];
};

export const prngShuffle = <T>(seed: number, array: T[]): [number, T[]] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const [next, j] = prngIntRange(seed, 0, i);
    seed = next;
    [result[i], result[j]] = [result[j], result[i]];
  }
  return [seed, result];
};

export const randomUnsignedInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
