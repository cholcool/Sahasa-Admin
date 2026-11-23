/**
 * Small seeded PRNG (mulberry32) so a mock dataset can be regenerated exactly from its seed.
 * Not for anything security related.
 */
export interface Rng {
  /** Float in [0, 1) */
  next: () => number;
  /** Integer in [min, max] inclusive */
  int: (min: number, max: number) => number;
  /** True with the given probability (0–1) */
  chance: (p: number) => boolean;
  pick: <T>(list: readonly T[]) => T;
  /** Pick by weight; `weights` must be the same length as `list` */
  weighted: <T>(list: readonly T[], weights: readonly number[]) => T;
}

export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(list: readonly T[]): T => {
    if (list.length === 0) throw new Error('pick() from an empty list');
    const item = list[Math.floor(next() * list.length)];
    if (item === undefined) throw new Error('pick() out of range');
    return item;
  };
  const weighted = <T>(list: readonly T[], weights: readonly number[]): T => {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = next() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weights[i] ?? 0;
      const item = list[i];
      if (r < 0 && item !== undefined) return item;
    }
    return pick(list);
  };
  return { next, int, chance: (p) => next() < p, pick, weighted };
}

/** Random seed for "generate new data" (6 digits so it is easy to read out and type back) */
export function randomSeed(): number {
  return 100000 + Math.floor(Math.random() * 900000);
}
