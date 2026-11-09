// Every number on screen in the Neural Networks lecture comes from here.
import { gauss, matmul, mean, rng, softmax, transpose, variance, type Mat } from '../../lib/math';

const r1 = (v: number) => Math.round(v * 10) / 10;

// --- Chapter 1: cross-entropy ------------------------------------------------------
export const EPS = 1e-15;
export const nll = (p: number) => -Math.log(p + EPS);
export const CE_SURE = { p: 0.9, loss: nll(0.9) };
export const CE_UNSURE = { p: 0.01, loss: nll(0.01) };

// a batch of 4 predictions over 3 classes
const g1 = gauss(14);
const r1g = rng(15);
export const CE_PRED: Mat = Array.from({ length: 4 }, () => softmax([1.6 * g1(), 1.6 * g1(), 1.6 * g1()]));
export const CE_LABEL = CE_PRED.map(() => Math.floor(r1g() * 3));
export const CE_ONEHOT: Mat = CE_LABEL.map((y) => [0, 1, 2].map((c) => (c === y ? 1 : 0)));
export const CE_ROW = CE_PRED.map((p, i) => nll(p[CE_LABEL[i]]));
export const CE_LOSS = Math.round(mean(CE_ROW) * 1e4) / 1e4;

// padded sequence + label smoothing (V = 5, eps = 0.1, last two tokens are padding)
export const V = 5;
export const SMOOTH = 0.1;
export const IGNORE = -100;
const g2 = gauss(23);
const r2g = rng(24);
export const SEQ_TARGETS = [0, 1, 2, 3, 4, 5].map((i) => (i >= 4 ? IGNORE : Math.floor(r2g() * V)));
export const SEQ_LOGITS: Mat = SEQ_TARGETS.map((y) => Array.from({ length: V }, (_, c) => 1.2 * g2() + (c === y ? 1.5 : 0)));
function tokenLoss(z: number[], y: number, eps: number) {
  const m = Math.max(...z);
  const lse = m + Math.log(z.reduce((a, v) => a + Math.exp(v - m), 0));
  const logp = z.map((v) => v - lse);
  return (1 - eps) * -logp[y] + eps * mean(logp.map((v) => -v));
}
export const SEQ_LOSS = SEQ_TARGETS.map((y, i) => (y === IGNORE ? null : tokenLoss(SEQ_LOGITS[i], y, SMOOTH)));
export const SEQ_LOSS_PLAIN = SEQ_TARGETS.map((y, i) => (y === IGNORE ? null : tokenLoss(SEQ_LOGITS[i], y, 0)));
const kept = SEQ_LOSS.filter((v): v is number => v !== null);
export const SEQ_MEAN = mean(kept);
export const SEQ_MEAN_PLAIN = mean(SEQ_LOSS_PLAIN.filter((v): v is number => v !== null));
export const N_REAL = kept.length;
/** smoothed target for a token whose class is 2 */
export const SMOOTH_TARGET = Array.from({ length: V }, (_, c) => (1 - SMOOTH) * (c === 2 ? 1 : 0) + SMOOTH / V);

// --- Chapter 2: a 2-layer MLP, batch of 4, 3 -> 4 -> 3 ------------------------------
const g3 = gauss(31);
const rnd = (rows: number, cols: number, s: number): Mat => Array.from({ length: rows }, () => Array.from({ length: cols }, () => r1(s * g3())));
export const X: Mat = rnd(4, 3, 1);
export const W1: Mat = rnd(3, 4, 0.8);
export const B1 = [0.1, 0.1, 0.1, 0.1];
export const W2: Mat = rnd(4, 3, 0.8);
export const B2 = [0, 0, 0];
export const LABELS = [0, 2, 1, 2];
export const Y: Mat = LABELS.map((y) => [0, 1, 2].map((c) => (c === y ? 1 : 0)));
const relu = (v: number) => Math.max(0, v);
export function forward(w1: Mat) {
  const Z1 = matmul(X, w1).map((r) => r.map((v, j) => v + B1[j]));
  const A1 = Z1.map((r) => r.map(relu));
  const Z2 = matmul(A1, W2).map((r) => r.map((v, j) => v + B2[j]));
  const P = Z2.map(softmax);
  const loss = mean(P.map((p, i) => -Math.log(p[LABELS[i]])));
  return { Z1, A1, Z2, P, loss };
}
export const FWD = forward(W1);
const m = X.length;
export const DZ2: Mat = FWD.P.map((p, i) => p.map((v, j) => v - Y[i][j]));
export const DW2: Mat = matmul(transpose(FWD.A1), DZ2).map((r) => r.map((v) => v / m));
export const DA1: Mat = matmul(DZ2, transpose(W2));
export const DZ1: Mat = DA1.map((r, i) => r.map((v, j) => (FWD.Z1[i][j] > 0 ? v : 0)));
export const DW1: Mat = matmul(transpose(X), DZ1).map((r) => r.map((v) => v / m));
/** numerical check of one entry of dW1 by central differences */
export const CHECK = (() => {
  const i = 0;
  // pick the entry of dW1 with the largest magnitude, so the check is meaningful
  let best = { i, j: 0, v: 0 };
  DW1.forEach((r, a) => r.forEach((v, b) => Math.abs(v) > Math.abs(best.v) && (best = { i: a, j: b, v })));
  const h = 1e-5;
  const plus = W1.map((r, a) => r.map((v, b) => (a === best.i && b === best.j ? v + h : v)));
  const minus = W1.map((r, a) => r.map((v, b) => (a === best.i && b === best.j ? v - h : v)));
  const numeric = (forward(plus).loss - forward(minus).loss) / (2 * h);
  return { i: best.i, j: best.j, analytic: best.v, numeric, h };
})();

// --- Chapter 3: activation scale through a 10-layer net, width 128 ------------------
export const DEPTH = 10;
export const WIDTH = 128;
const BATCH = 64;
export const XAVIER_STD = Math.sqrt(2 / (WIDTH + WIDTH));
export const HE_STD = Math.sqrt(2 / WIDTH);
function depthStds(std: number, act: (v: number) => number, seed: number): number[] {
  const g = gauss(seed);
  let h: Mat = Array.from({ length: BATCH }, () => Array.from({ length: WIDTH }, () => g()));
  const out: number[] = [];
  for (let l = 0; l < DEPTH; l++) {
    const w: Mat = Array.from({ length: WIDTH }, () => Array.from({ length: WIDTH }, () => g() * std));
    h = matmul(h, w).map((r) => r.map(act));
    out.push(Math.sqrt(variance(h.flat()) + mean(h.flat()) ** 2)); // RMS of the activations
  }
  return out;
}
export const INIT = [
  { name: 'too small · 0.03', std: 0.03, act: 'ReLU', rms: depthStds(0.03, relu, 41) },
  { name: 'too large · 0.2', std: 0.2, act: 'ReLU', rms: depthStds(0.2, relu, 42) },
  { name: `Xavier · ${XAVIER_STD.toFixed(3)}`, std: XAVIER_STD, act: 'tanh', rms: depthStds(XAVIER_STD, Math.tanh, 43) },
  { name: `He · ${HE_STD.toFixed(3)}`, std: HE_STD, act: 'ReLU', rms: depthStds(HE_STD, relu, 44) },
];

// --- Chapter 4: batch norm, 6 examples x 3 features on very different scales -----------
const g4 = gauss(52);
const SCALES = [{ mu: 40, sd: 12 }, { mu: -2, sd: 0.4 }, { mu: 5, sd: 3 }];
export const BN_X: Mat = Array.from({ length: 6 }, () => SCALES.map((s) => r1(s.mu + s.sd * g4())));
export const BN_EPS = 1e-5;
export const BN_MU = [0, 1, 2].map((j) => mean(BN_X.map((r) => r[j])));
export const BN_VAR = [0, 1, 2].map((j) => variance(BN_X.map((r) => r[j]))); // population variance, like np.var
export const BN_NORM: Mat = BN_X.map((r) => r.map((v, j) => (v - BN_MU[j]) / Math.sqrt(BN_VAR[j] + BN_EPS)));
export const GAMMA = [1, 1, 1];
export const BETA = [0, 0, 0];
export const BN_OUT_MU = [0, 1, 2].map((j) => mean(BN_NORM.map((r) => r[j])));
export const BN_OUT_VAR = [0, 1, 2].map((j) => variance(BN_NORM.map((r) => r[j])));

// --- Chapter 5: dropout, keep_prob = 0.5 ------------------------------------------------
export const KEEP = 0.5;
const g5 = gauss(61);
const r5 = rng(62);
export const DROP_X: Mat = Array.from({ length: 4 }, () => Array.from({ length: 6 }, () => r1(Math.abs(1.2 * g5()))));
export const DROP_MASK: Mat = DROP_X.map((r) => r.map(() => (r5() < KEEP ? 1 / KEEP : 0)));
export const DROP_OUT: Mat = DROP_X.map((r, i) => r.map((v, j) => v * DROP_MASK[i][j]));
/** expected value check: one activation through 10,000 random masks */
export const EV_TRIALS = 10000;
const r6 = rng(63);
export const EV_X = DROP_X[0][0];
export const EV_MEAN = Array.from({ length: EV_TRIALS }, () => (r6() < KEEP ? EV_X / KEEP : 0)).reduce((a, b) => a + b, 0) / EV_TRIALS;
