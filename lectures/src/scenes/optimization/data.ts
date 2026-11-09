// Every number on screen in the Optimization lecture comes from here.
import { gauss, rng } from '../../lib/math';

type P = [number, number];

// --- Chapters 1-2: a long, narrow valley -----------------------------------
// f(x, y) = 0.5 * (A x^2 + B y^2): gentle along x, steep across y.
export const VA = 0.15;
export const VB = 8;
export const valley = (x: number, y: number) => 0.5 * (VA * x * x + VB * y * y);
const grad = ([x, y]: P): P => [VA * x, VB * y];
export const START: P = [-9, 2.2];
export const STEPS = 40;
export const LR_SGD = 0.245;
export const LR_MOM = 0.245;
export const MU = 0.6;
export const LR_ADAM = 0.3;
export const B1 = 0.9;
export const B2 = 0.999;
export const ADAM_EPS = 1e-8;

function runSGD(): P[] {
  const out: P[] = [START];
  let p = START;
  for (let t = 0; t < STEPS; t++) {
    const g = grad(p);
    p = [p[0] - LR_SGD * g[0], p[1] - LR_SGD * g[1]];
    out.push(p);
  }
  return out;
}

function runMomentum(): P[] {
  const out: P[] = [START];
  let p = START;
  let v: P = [0, 0];
  for (let t = 0; t < STEPS; t++) {
    const g = grad(p);
    v = [MU * v[0] + g[0], MU * v[1] + g[1]];
    p = [p[0] - LR_MOM * v[0], p[1] - LR_MOM * v[1]];
    out.push(p);
  }
  return out;
}

function runAdam(): P[] {
  const out: P[] = [START];
  let p = START;
  let m: P = [0, 0];
  let v: P = [0, 0];
  for (let t = 1; t <= STEPS; t++) {
    const g = grad(p);
    m = [B1 * m[0] + (1 - B1) * g[0], B1 * m[1] + (1 - B1) * g[1]];
    v = [B2 * v[0] + (1 - B2) * g[0] ** 2, B2 * v[1] + (1 - B2) * g[1] ** 2];
    const mh = m.map((x) => x / (1 - B1 ** t));
    const vh = v.map((x) => x / (1 - B2 ** t));
    p = [p[0] - (LR_ADAM * mh[0]) / (Math.sqrt(vh[0]) + ADAM_EPS), p[1] - (LR_ADAM * mh[1]) / (Math.sqrt(vh[1]) + ADAM_EPS)];
    out.push(p);
  }
  return out;
}

export const PATH_SGD = runSGD();
export const PATH_MOM = runMomentum();
export const PATH_ADAM = runAdam();
export const lossAt = (path: P[], i: number) => valley(path[i][0], path[i][1]);

// --- Chapter 2: per-parameter step sizes ------------------------------------
// Two parameters whose gradients differ in scale by 400x (noisy, same sign).
export const ADAM_PARAMS = [
  { name: 'w₁', scale: 20 },
  { name: 'w₂', scale: 0.05 },
];
export const ADAM_LR = 0.001;
export const ADAM_T = 50;
export const PER_PARAM = (() => {
  const g = gauss(11);
  return ADAM_PARAMS.map(({ name, scale }) => {
    let m = 0;
    let v = 0;
    let sgd = 0;
    let adam = 0;
    let lastG = 0;
    for (let t = 1; t <= ADAM_T; t++) {
      const gt = scale * (1 + 0.3 * g());
      m = B1 * m + (1 - B1) * gt;
      v = B2 * v + (1 - B2) * gt * gt;
      adam = (ADAM_LR * (m / (1 - B1 ** t))) / (Math.sqrt(v / (1 - B2 ** t)) + ADAM_EPS);
      sgd = ADAM_LR * gt;
      lastG = gt;
    }
    return { name, grad: lastG, sgd, adam };
  });
})();

// Bias correction with a constant gradient g = 1: raw m_t = 1 - beta1^t.
export const BC_T = 12;
export const BIAS = Array.from({ length: BC_T }, (_, i) => {
  const t = i + 1;
  let m = 0;
  for (let k = 0; k < t; k++) m = B1 * m + (1 - B1) * 1;
  return { t, raw: m, factor: 1 - B1 ** t, corrected: m / (1 - B1 ** t) };
});

// --- Chapter 3: warmup + cosine schedule ------------------------------------
export const SCHED = { total: 2000, warmup: 200, maxLr: 3e-4, minLr: 3e-5 };
export function lrAt(step: number): number {
  const { total, warmup, maxLr, minLr } = SCHED;
  if (step < warmup) return (maxLr * step) / warmup;
  const p = Math.min(1, (step - warmup) / (total - warmup));
  return minLr + 0.5 * (maxLr - minLr) * (1 + Math.cos(Math.PI * p));
}
export const SCHED_PTS: P[] = Array.from({ length: 201 }, (_, i) => {
  const s = (i / 200) * SCHED.total;
  return [s, lrAt(s)];
});

// --- Chapter 4: gradient clipping -----------------------------------------
export function clipGradNorm(grads: number[][][], maxNorm: number, eps = 1e-6) {
  const total = Math.sqrt(grads.reduce((s, g) => s + g.flat().reduce((a, v) => a + v * v, 0), 0));
  const coef = maxNorm / (total + eps);
  const clipped = coef < 1 ? grads.map((g) => g.map((r) => r.map((v) => v * coef))) : grads.map((g) => g.map((r) => [...r]));
  return { total, coef, clipped };
}
/** The problem's hidden example: a 2x2 matrix and a vector, max_norm = 2. */
export const CLIP_GRADS = [
  [
    [1, 2],
    [2, 4],
  ],
  [[4, 0]],
];
export const CLIP_MAX = 2;
export const CLIP = clipGradNorm(CLIP_GRADS, CLIP_MAX);
export const CLIP_FLAT = CLIP_GRADS.flatMap((g) => g.flat());
export const CLIP_SQ_SUM = CLIP_FLAT.reduce((a, v) => a + v * v, 0);
export const CLIP_FLAT_OUT = CLIP.clipped.flatMap((g) => g.flat());

// A tiny training run (linear regression, minibatch SGD) where one batch has
// corrupted labels: without clipping the loss spikes; with clipping it doesn't.
export const RUN_STEPS = 120;
export const BAD_STEP = 60;
const DIM = 5;
const RUN_LR = 0.1;
const RUN_CLIP = 1.0;
export const TRAIN = (() => {
  const g = gauss(2024);
  const wTrue = Array.from({ length: DIM }, () => g());
  const batches = Array.from({ length: RUN_STEPS }, (_, s) => {
    const xs = Array.from({ length: 16 }, () => Array.from({ length: DIM }, () => g()));
    const ys = xs.map((x) => x.reduce((a, v, j) => a + v * wTrue[j], 0) + 0.3 * g() + (s === BAD_STEP ? 40 * (g() > 0 ? 1 : -1) : 0));
    return { xs, ys };
  });
  // fixed clean evaluation set
  const ex = Array.from({ length: 256 }, () => Array.from({ length: DIM }, () => g()));
  const ey = ex.map((x) => x.reduce((a, v, j) => a + v * wTrue[j], 0) + 0.3 * g());
  const evalLoss = (w: number[]) => ex.reduce((a, x, i) => a + (x.reduce((s, v, j) => s + v * w[j], 0) - ey[i]) ** 2, 0) / ex.length / 2;
  const run = (clip: boolean) => {
    const w = new Array(DIM).fill(0);
    const loss: number[] = [evalLoss(w)];
    const norms: number[] = [];
    for (const { xs, ys } of batches) {
      const gr = new Array(DIM).fill(0);
      xs.forEach((x, i) => {
        const err = x.reduce((s, v, j) => s + v * w[j], 0) - ys[i];
        x.forEach((v, j) => (gr[j] += (err * v) / xs.length));
      });
      const n = Math.sqrt(gr.reduce((a, v) => a + v * v, 0));
      norms.push(n);
      const c = clip ? Math.min(1, RUN_CLIP / (n + 1e-6)) : 1;
      gr.forEach((v, j) => (w[j] -= RUN_LR * c * v));
      loss.push(evalLoss(w));
    }
    return { loss, norms };
  };
  return { plain: run(false), clipped: run(true) };
})();

// --- Chapter 5: mixed precision ---------------------------------------------
export const FP16_MIN_SUB = 2 ** -24; // ~5.96e-8: below half of this rounds to 0
export const FP16_MIN_NORMAL = 2 ** -14; // ~6.1e-5
export const FP16_MAX = 65504;
/** log10 |gradient| for a batch of simulated gradient values (log-normal). */
export const GRAD_LOG10 = (() => {
  const g = gauss(77);
  return Array.from({ length: 6000 }, () => -7.2 + 1.3 * g());
})();
export const HIST_LO = -12;
export const HIST_HI = 8;
export const HIST_BW = 0.25;
export function hist(shift: number) {
  const n = Math.round((HIST_HI - HIST_LO) / HIST_BW);
  const bins = new Array(n).fill(0);
  for (const v of GRAD_LOG10) {
    const b = Math.floor((v + shift - HIST_LO) / HIST_BW);
    if (b >= 0 && b < n) bins[b]++;
  }
  return bins.map((c) => c / GRAD_LOG10.length);
}
export const LOSS_SCALE = 2 ** 16;
export const BIG_SCALE = 2 ** 32;
const L = (x: number) => Math.log10(x);
export const fracBelow = (shift: number) => GRAD_LOG10.filter((v) => v + shift < L(FP16_MIN_SUB)).length / GRAD_LOG10.length;
export const fracAbove = (shift: number) => GRAD_LOG10.filter((v) => v + shift > L(FP16_MAX)).length / GRAD_LOG10.length;
export const UNDER_RAW = fracBelow(0);
export const UNDER_SCALED = fracBelow(L(LOSS_SCALE));
export const OVER_SCALED = fracAbove(L(LOSS_SCALE));
export const OVER_BIG = fracAbove(L(BIG_SCALE));

/** GradScaler's update rule, exactly as in the Dynamic Loss Scaling problem. */
export function dynamicLossScale(overflows: boolean[], initScale = 65536, growthFactor = 2, backoffFactor = 0.5, growthInterval = 2000) {
  let scale = initScale;
  let good = 0;
  const scales: number[] = [];
  const skipped: number[] = [];
  overflows.forEach((o, i) => {
    scales.push(scale);
    if (o) {
      skipped.push(i);
      scale *= backoffFactor;
      good = 0;
    } else {
      good += 1;
      if (good === growthInterval) {
        scale *= growthFactor;
        good = 0;
      }
    }
  });
  return { scales, skipped, finalScale: scale };
}
// Simulated run: a step overflows when scale * (largest gradient) exceeds the fp16 max.
export const DLS_STEPS = 90;
export const DLS_INTERVAL = 8;
export const DLS_INIT = 2 ** 10;
export const DLS = (() => {
  const r = rng(5);
  const g = gauss(6);
  const maxGrad = Array.from({ length: DLS_STEPS }, () => 10 ** (-0.2 + 0.25 * g() + 0 * r()));
  let scale = DLS_INIT;
  let good = 0;
  const overflows: boolean[] = [];
  // decide overflow with the scale in force at each step (same rule as dynamicLossScale)
  for (let i = 0; i < DLS_STEPS; i++) {
    const o = scale * maxGrad[i] > FP16_MAX;
    overflows.push(o);
    if (o) {
      scale *= 0.5;
      good = 0;
    } else if (++good === DLS_INTERVAL) {
      scale *= 2;
      good = 0;
    }
  }
  return { overflows, ...dynamicLossScale(overflows, DLS_INIT, 2, 0.5, DLS_INTERVAL) };
})();
