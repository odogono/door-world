// Pseudo-random number generator
export class PRNG {
  private seed: number;
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = Math.pow(2, 32);

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  getSeed(): number {
    return this.seed;
  }

  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  // Generate a random integer between min (inclusive) and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextIntRange(range: [number, number]): number {
    return this.nextInt(range[0], range[1]);
  }

  // Generate a random float between min (inclusive) and max (exclusive)
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  // Shuffle an array using Fisher-Yates algorithm
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
