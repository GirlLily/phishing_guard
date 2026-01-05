export type HashPair = { phash: string; dhash: string; ahash?: string };
export type Band = "STRONG" | "MEDIUM" | "LOW";

export function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let dist = Math.abs(a.length - b.length) * 4; // rough penalty for length mismatch
  for (let i = 0; i < len; i++) {
    const n1 = parseInt(a[i], 16);
    const n2 = parseInt(b[i], 16);
    dist += bitCount(n1 ^ n2);
  }
  return dist;
}

export function similarityScore(a: string, b: string): number {
  const bits = Math.max(a.length, b.length) * 4;
  const distance = hammingDistance(a, b);
  return bits === 0 ? 0 : 1 - distance / bits;
}

export function bestSimilarity(candidate: HashPair, baselines: HashPair[], thresholds: { strong: number; medium: number }): { score: number; band: Band } {
  let best = 0;
  for (const base of baselines) {
    const scores: number[] = [
      similarityScore(candidate.phash, base.phash),
      similarityScore(candidate.dhash, base.dhash)
    ];
    if (candidate.ahash && base.ahash) {
      scores.push(similarityScore(candidate.ahash, base.ahash));
    }
    const maxScore = Math.max(...scores);
    best = Math.max(best, maxScore);
  }

  if (best >= thresholds.strong) return { score: best, band: "STRONG" };
  if (best >= thresholds.medium) return { score: best, band: "MEDIUM" };
  return { score: best, band: "LOW" };
}

function bitCount(n: number): number {
  let c = 0;
  for (let i = 0; i < 4; i++) {
    if (n & (1 << i)) c++;
  }
  return c;
}
