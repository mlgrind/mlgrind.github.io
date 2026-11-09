// Every number on screen in the End-to-End Implementations lecture comes from here.
import { causalMask, gauss, rng, softmax, type Mat } from '../../lib/math';

// --- Chapter 1: which blocks each capstone assembles -----------------------
export const BLOCKS = ['Linear', 'Softmax + CE', 'Backprop', 'Attention', 'LayerNorm', 'Positions', 'Conv + Pool', 'Reparam + KL', 'Noise schedule', 'Codebook'];
export const CAPSTONES: { name: string; uses: string[] }[] = [
  { name: '2-Layer MLP', uses: ['Linear', 'Softmax + CE', 'Backprop'] },
  { name: 'Transformer Encoder', uses: ['Linear', 'Attention', 'LayerNorm', 'Positions'] },
  { name: 'VAE', uses: ['Linear', 'Reparam + KL'] },
  { name: 'VQ-VAE', uses: ['Linear', 'Codebook'] },
  { name: 'Diffusion Model', uses: ['Linear', 'Noise schedule'] },
  { name: 'CNN', uses: ['Linear', 'Softmax + CE', 'Conv + Pool'] },
  { name: 'Mini GPT', uses: ['Linear', 'Softmax + CE', 'Attention', 'LayerNorm', 'Positions'] },
  { name: 'Tiny ViT', uses: ['Linear', 'Softmax + CE', 'Attention', 'LayerNorm', 'Positions'] },
  { name: 'Transformer Bug Hunt', uses: ['Linear', 'Attention', 'LayerNorm', 'Positions'] },
];

// --- Chapter 2: a 2-layer MLP trained on 3 interleaved spirals --------------
export const N_CLASS = 3;
export const N_PER = 60;
export const HIDDEN = 24;
const gs = gauss(12);
export const SPIRAL_X: number[][] = [];
export const SPIRAL_Y: number[] = [];
for (let c = 0; c < N_CLASS; c++) {
  for (let i = 0; i < N_PER; i++) {
    const r = i / N_PER;
    const t = c * 4.2 + r * 4.2 + gs() * 0.2;
    SPIRAL_X.push([r * Math.sin(t), r * Math.cos(t)]);
    SPIRAL_Y.push(c);
  }
}

export interface MLP {
  W1: Mat;
  b1: number[];
  W2: Mat;
  b2: number[];
}
export function initMLP(seed: number, nin: number, nh: number, nout: number): MLP {
  const g = gauss(seed);
  return {
    W1: Array.from({ length: nin }, () => Array.from({ length: nh }, () => g() * Math.sqrt(2 / nin))),
    b1: new Array(nh).fill(0),
    W2: Array.from({ length: nh }, () => Array.from({ length: nout }, () => g() * Math.sqrt(1 / nh))),
    b2: new Array(nout).fill(0),
  };
}
export function forward(m: MLP, x: number[]) {
  const h = m.b1.map((b, j) => Math.max(0, b + x.reduce((a, xi, i) => a + xi * m.W1[i][j], 0)));
  const logits = m.b2.map((b, k) => b + h.reduce((a, hj, j) => a + hj * m.W2[j][k], 0));
  return { h, logits, p: softmax(logits) };
}
export function lossOf(m: MLP, X: number[][], Y: number[]) {
  return X.reduce((a, x, n) => a - Math.log(forward(m, x).p[Y[n]] + 1e-12), 0) / X.length;
}
/** analytic gradients, exactly the backward pass in the problem */
export function grads(m: MLP, X: number[][], Y: number[]) {
  const nin = m.W1.length;
  const nh = m.b1.length;
  const nout = m.b2.length;
  const gW1 = Array.from({ length: nin }, () => new Array(nh).fill(0));
  const gb1 = new Array(nh).fill(0);
  const gW2 = Array.from({ length: nh }, () => new Array(nout).fill(0));
  const gb2 = new Array(nout).fill(0);
  X.forEach((x, n) => {
    const { h, p } = forward(m, x);
    const dl = p.map((pk, k) => (pk - (k === Y[n] ? 1 : 0)) / X.length); // softmax - onehot
    for (let j = 0; j < nh; j++) for (let k = 0; k < nout; k++) gW2[j][k] += h[j] * dl[k];
    dl.forEach((d, k) => (gb2[k] += d));
    const dh = h.map((_, j) => dl.reduce((a, d, k) => a + d * m.W2[j][k], 0));
    const dr = dh.map((d, j) => (h[j] > 0 ? d : 0)); // ReLU gate
    for (let i = 0; i < nin; i++) for (let j = 0; j < nh; j++) gW1[i][j] += x[i] * dr[j];
    dr.forEach((d, j) => (gb1[j] += d));
  });
  return { gW1, gb1, gW2, gb2 };
}
function sgdStep(m: MLP, X: number[][], Y: number[], lr: number, vel: MLP, mom = 0.9) {
  const g = grads(m, X, Y);
  const upd = (p: number[], v: number[], gg: number[]) => p.forEach((_, i) => ((v[i] = mom * v[i] - lr * gg[i]), (p[i] += v[i])));
  m.W1.forEach((r, i) => upd(r, vel.W1[i], g.gW1[i]));
  upd(m.b1, vel.b1, g.gb1);
  m.W2.forEach((r, i) => upd(r, vel.W2[i], g.gW2[i]));
  upd(m.b2, vel.b2, g.gb2);
}
const zerosLike = (m: MLP): MLP => ({
  W1: m.W1.map((r) => r.map(() => 0)),
  b1: m.b1.map(() => 0),
  W2: m.W2.map((r) => r.map(() => 0)),
  b2: m.b2.map(() => 0),
});
const clone = (m: MLP): MLP => JSON.parse(JSON.stringify(m));

export const STEPS = 300;
export const CHECKPOINTS = Array.from({ length: STEPS / 10 + 1 }, (_, i) => i * 10);
export const GRID = 36;
export const GRID_RANGE = 1.15;
export const LOSS_EVERY = 5;
const MLP0 = initMLP(5, 2, HIDDEN, N_CLASS);
const regionOf = (m: MLP) =>
  Array.from({ length: GRID }, (_, r) =>
    Array.from({ length: GRID }, (_, c) => {
      const x = -GRID_RANGE + ((c + 0.5) / GRID) * 2 * GRID_RANGE;
      const y = GRID_RANGE - ((r + 0.5) / GRID) * 2 * GRID_RANGE;
      const p = forward(m, [x, y]).p;
      return p.indexOf(Math.max(...p));
    }),
  );
const accOf = (m: MLP) =>
  SPIRAL_X.filter((x, n) => {
    const p = forward(m, x).p;
    return p.indexOf(Math.max(...p)) === SPIRAL_Y[n];
  }).length / SPIRAL_X.length;
/** Lazy (training takes a moment; only this lecture's scenes call it). */
function memo<T>(f: () => T): () => T {
  let v: T | undefined;
  return () => (v ??= f());
}
export const training = memo(() => {
  const mlp = clone(MLP0);
  const vel = zerosLike(mlp);
  const lossCurve: number[] = [];
  const regions: number[][][] = [];
  const accuracy: number[] = [];
  for (let s = 0; s <= STEPS; s++) {
    if (s % LOSS_EVERY === 0) lossCurve.push(lossOf(mlp, SPIRAL_X, SPIRAL_Y));
    if (CHECKPOINTS.includes(s)) {
      regions.push(regionOf(mlp));
      accuracy.push(accOf(mlp));
    }
    if (s < STEPS) sgdStep(mlp, SPIRAL_X, SPIRAL_Y, 0.5, vel);
  }
  return { lossCurve, regions, accuracy };
});

/** one example's softmax - onehot at initialization */
export const EX_N = 17;
export const EX = (() => {
  const { p } = forward(MLP0, SPIRAL_X[EX_N]);
  const y = p.map((_, k) => (k === SPIRAL_Y[EX_N] ? 1 : 0));
  return { p, y, d: p.map((pk, k) => pk - y[k]) };
})();

// CNN shapes for a 28x28 input, as in the CNN capstone (3x3 convs, no padding, 2x2 pools)
const conv = (n: number, k: number) => n - k + 1;
const pool = (n: number) => Math.floor(n / 2);
const s1 = conv(28, 3);
const s2 = pool(s1);
const s3 = conv(s2, 3);
const s4 = pool(s3);
export const CNN_SHAPES = [
  { label: 'input', size: 28, ch: 1 },
  { label: 'conv 3×3', size: s1, ch: 32 },
  { label: 'pool 2×2', size: s2, ch: 32 },
  { label: 'conv 3×3', size: s3, ch: 64 },
  { label: 'pool 2×2', size: s4, ch: 64 },
];
export const FLAT = s4 * s4 * 64;

// --- Chapter 3: transformers ----------------------------------------------
export const VOCAB = 65;
export const LOG_V = Math.log(VOCAB);
/** initial loss of a near-zero-logit model: logits ~ N(0, 0.02^2 * fan-in scale), random targets */
export const INIT_LOSS = (() => {
  const g = gauss(65);
  const r = rng(66);
  let tot = 0;
  const N = 256;
  for (let n = 0; n < N; n++) {
    const logits = Array.from({ length: VOCAB }, () => g() * 0.02 * 4);
    const t = Math.floor(r() * VOCAB);
    tot -= Math.log(softmax(logits)[t]);
  }
  return tot / N;
})();
export const T_ATT = 6;
const ga = gauss(9);
const SCORES: Mat = Array.from({ length: T_ATT }, () => Array.from({ length: T_ATT }, () => ga() * 1.2));
export const CAUSAL_ATT: Mat = SCORES.map((r, i) => softmax(r.map((v, j) => v + causalMask(T_ATT)[i][j])));
export const ROW_SUMS = CAUSAL_ATT.map((r) => r.reduce((a, b) => a + b, 0));
export const FUTURE_MAX = Math.max(...CAUSAL_ATT.flatMap((r, i) => r.filter((_, j) => j > i)));

export const IMG = 32;
export const PATCH = 8;
export const N_PATCH = (IMG / PATCH) ** 2;
/** a smooth seeded test image in [0, 1] */
export const IMAGE: Mat = (() => {
  const g = rng(32);
  const blobs = Array.from({ length: 6 }, () => ({ x: g() * IMG, y: g() * IMG, s: 2.5 + g() * 4, a: 0.4 + g() * 0.6 }));
  const raw = Array.from({ length: IMG }, (_, y) =>
    Array.from({ length: IMG }, (_, x) => blobs.reduce((v, b) => v + b.a * Math.exp(-((x - b.x) ** 2 + (y - b.y) ** 2) / (2 * b.s * b.s)), 0)),
  );
  const lo = Math.min(...raw.flat());
  const hi = Math.max(...raw.flat());
  return raw.map((r) => r.map((v) => (v - lo) / (hi - lo)));
})();

// --- Chapter 4: generative models -----------------------------------------
const gv = gauss(44);
export const VAE_MU = [0.8, -0.4];
export const VAE_LOGVAR = [-1.2, -0.3];
export const VAE_EPS = [gv(), gv()];
export const VAE_SIGMA = VAE_LOGVAR.map((l) => Math.exp(0.5 * l));
export const VAE_Z = VAE_MU.map((m, i) => m + VAE_SIGMA[i] * VAE_EPS[i]);
export const VAE_KL = -0.5 * VAE_MU.reduce((a, m, i) => a + 1 + VAE_LOGVAR[i] - m * m - Math.exp(VAE_LOGVAR[i]), 0);

const gq = gauss(7);
export const CODEBOOK: Mat = [
  [-0.6, 0.55],
  [0.55, 0.6],
  [0.0, -0.05],
  [-0.55, -0.6],
  [0.65, -0.5],
];
export const Z_E: Mat = Array.from({ length: 40 }, (_, i) => {
  const c = CODEBOOK[i % CODEBOOK.length];
  return [c[0] + gq() * 0.2, c[1] + gq() * 0.2];
});
export const ASSIGN = Z_E.map((z) => {
  const d = CODEBOOK.map((e) => (z[0] - e[0]) ** 2 + (z[1] - e[1]) ** 2);
  return d.indexOf(Math.min(...d));
});
export const COMMIT = Z_E.reduce((a, z, i) => a + (z[0] - CODEBOOK[ASSIGN[i]][0]) ** 2 + (z[1] - CODEBOOK[ASSIGN[i]][1]) ** 2, 0) / (Z_E.length * 2);

export const T_DIFF = 1000;
export const BETAS = Array.from({ length: T_DIFF }, (_, t) => 1e-4 + ((0.02 - 1e-4) * t) / (T_DIFF - 1));
export const ALPHA_BAR: number[] = [];
BETAS.reduce((acc, b) => {
  const v = acc * (1 - b);
  ALPHA_BAR.push(v);
  return v;
}, 1);
export const DIFF_T = [0, 100, 300, 999];
export const SIGNAL_N = 120;
export const X0 = Array.from({ length: SIGNAL_N }, (_, i) => Math.sin((i / SIGNAL_N) * Math.PI * 4) * 0.9);
const gd = gauss(1000);
export const NOISE = Array.from({ length: SIGNAL_N }, () => gd());
export const XT = DIFF_T.map((t) => X0.map((x, i) => Math.sqrt(ALPHA_BAR[t]) * x + Math.sqrt(1 - ALPHA_BAR[t]) * NOISE[i]));

// --- Chapter 5: checks ---------------------------------------------------
/** finite-difference gradient check on the spiral MLP at initialization */
export const gradCheck = memo(() => {
  const h = 1e-5;
  const g = grads(MLP0, SPIRAL_X, SPIRAL_Y);
  const picks: [string, 'W1' | 'W2', number, number][] = [
    ['W1[0,3]', 'W1', 0, 3],
    ['W1[1,7]', 'W1', 1, 7],
    ['W2[5,1]', 'W2', 5, 1],
    ['W2[11,2]', 'W2', 11, 2],
  ];
  return picks.map(([name, which, i, j]) => {
    const plus = clone(MLP0);
    const minus = clone(MLP0);
    plus[which][i][j] += h;
    minus[which][i][j] -= h;
    const numeric = (lossOf(plus, SPIRAL_X, SPIRAL_Y) - lossOf(minus, SPIRAL_X, SPIRAL_Y)) / (2 * h);
    const analytic = which === 'W1' ? g.gW1[i][j] : g.gW2[i][j];
    return { name, analytic, numeric, diff: Math.abs(analytic - numeric) };
  });
});
/** a fresh 10-class classifier: small random weights on random inputs */
export const tenClass = memo(() => {
  const m = initMLP(10, 8, 16, 10);
  m.W2 = m.W2.map((r) => r.map((v) => v * 0.01));
  const g = gauss(11);
  const r = rng(12);
  const X = Array.from({ length: 128 }, () => Array.from({ length: 8 }, () => g()));
  const Y = X.map(() => Math.floor(r() * 10));
  return { loss: lossOf(m, X, Y), log10: Math.log(10) };
});
/** overfit 8 spiral points */
export const overfit = memo(() => {
  const idx = [3, 25, 47, 70, 95, 118, 140, 170];
  const X = idx.map((i) => SPIRAL_X[i]);
  const Y = idx.map((i) => SPIRAL_Y[i]);
  const m = initMLP(21, 2, HIDDEN, N_CLASS);
  const vel = zerosLike(m);
  const curve: number[] = [];
  for (let s = 0; s <= 200; s++) {
    if (s % 4 === 0) curve.push(lossOf(m, X, Y));
    if (s < 200) sgdStep(m, X, Y, 0.3, vel);
  }
  return curve;
});
