// Small, dependency-free linear algebra for the on-screen examples. Every
// number shown in a lecture is computed here from a seeded RNG, never typed in.
export type Mat = number[][];

/** mulberry32: tiny deterministic PRNG */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** standard normal sampler (Box-Muller) */
export function gauss(seed: number): () => number {
  const r = rng(seed);
  return () => {
    const u = Math.max(r(), 1e-12);
    const v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

export const randn = (g: () => number, rows: number, cols: number, scale = 1): Mat =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => g() * scale));

export const matmul = (a: Mat, b: Mat): Mat =>
  a.map((row) => b[0].map((_, j) => row.reduce((s, v, k) => s + v * b[k][j], 0)));

export const transpose = (a: Mat): Mat => a[0].map((_, j) => a.map((r) => r[j]));

export const scale = (a: Mat, s: number): Mat => a.map((r) => r.map((v) => v * s));

export const add = (a: Mat, b: Mat): Mat => a.map((r, i) => r.map((v, j) => v + b[i][j]));

export function softmax(row: number[]): number[] {
  const finite = row.filter((v) => v !== -Infinity);
  const m = Math.max(...finite);
  const e = row.map((v) => (v === -Infinity ? 0 : Math.exp(v - m)));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

export const softmaxRows = (a: Mat): Mat => a.map(softmax);

export const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;

export const variance = (v: number[]) => {
  const m = mean(v);
  return v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length;
};

export const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

/** Frobenius norm of the softmax Jacobian diag(p) - p p^T: how much gradient flows back. */
export function softmaxJacobianNorm(p: number[]): number {
  let s = 0;
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < p.length; j++) {
      const v = (i === j ? p[i] : 0) - p[i] * p[j];
      s += v * v;
    }
  }
  return Math.sqrt(s);
}

export function layerNormRow(x: number[], eps = 1e-5) {
  const mu = mean(x);
  const v = variance(x);
  const sd = Math.sqrt(v + eps);
  return { mu, var: v, sd, out: x.map((xi) => (xi - mu) / sd) };
}

/** One entry of the sinusoidal positional encoding (Vaswani et al. 2017); `pos` may be fractional for smooth plots. */
export function peValue(pos: number, j: number, d: number): number {
  const i = Math.floor(j / 2);
  const angle = pos / Math.pow(10000, (2 * i) / d);
  return j % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

export function positionalEncoding(positions: number, d: number): Mat {
  return Array.from({ length: positions }, (_, pos) => Array.from({ length: d }, (_, j) => peValue(pos, j, d)));
}

export function causalMask(n: number): Mat {
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (j > i ? -Infinity : 0)));
}

/** Python-style round-half-even is overkill here; fixed decimals, no "-0.00". */
export function fmt(v: number, d = 2): string {
  if (v === -Infinity) return '−∞';
  if (v === Infinity) return '∞';
  const s = v.toFixed(d);
  return (Number(s) === 0 ? (0).toFixed(d) : s).replace('-', '−');
}
