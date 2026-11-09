// Every number on screen in the PyTorch Basics lecture comes from here.
import { gauss, matmul, rng, softmax, transpose, type Mat } from '../../lib/math';

const round = (v: number, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// --- Chapter 1: tensors -------------------------------------------------------------
const g1 = gauss(12);
export const T23: Mat = Array.from({ length: 2 }, () => Array.from({ length: 3 }, () => round(g1(), 1)));
export const T_SUM_DIM1 = T23.map((r) => r.reduce((a, b) => a + b, 0));
export const T_VIEW32: Mat = [0, 1, 2].map((i) => T23.flat().slice(i * 2, i * 2 + 2)); // .view(3, 2)

// --- Chapter 2: autograd on y = x^2 + 3x + 1 at x = 2 -----------------------------------
export const X0 = 2;
export const SQ = X0 ** 2;
export const LIN = 3 * X0;
export const Y0 = SQ + LIN + 1;
export const D_SQ = 2 * X0; // d(x^2)/dx
export const D_LIN = 3; // d(3x)/dx
export const XGRAD = D_SQ + D_LIN;
// linear layer Y = X W + b, backward
const r2 = rng(6);
const ri = (lo: number, hi: number) => lo + Math.floor(r2() * (hi - lo + 1));
export const LX: Mat = Array.from({ length: 4 }, () => Array.from({ length: 3 }, () => ri(-2, 3)));
export const LG: Mat = Array.from({ length: 4 }, () => Array.from({ length: 2 }, () => ri(-2, 2)));
export const GRAD_W = matmul(transpose(LX), LG);
export const GRAD_B = LG[0].map((_, j) => LG.reduce((s, r) => s + r[j], 0));

// --- Chapter 3: Linear(3, 2) -> ReLU, and losses -----------------------------------------
const g3 = gauss(30);
export const MX: Mat = Array.from({ length: 4 }, () => Array.from({ length: 3 }, () => round(g3(), 1)));
export const MW: Mat = Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => round(g3() * 0.8, 1)));
export const MBIAS = [round(g3() * 0.3, 1), round(g3() * 0.3, 1)];
export const LIN_OUT: Mat = matmul(MX, MW).map((r) => r.map((v, j) => v + MBIAS[j]));
export const RELU_OUT: Mat = LIN_OUT.map((r) => r.map((v) => Math.max(0, v)));
export const LOGITS = [round(g3() + 1, 1), round(g3(), 1), round(g3() - 1, 1)];
export const TARGET = 0;
export const PROBS = softmax(LOGITS);
export const MAXLOGIT = Math.max(...LOGITS);
export const SHIFTED = LOGITS.map((v) => v - MAXLOGIT);
export const CE = -Math.log(PROBS[TARGET]);
export const MSE_PRED = [round(g3() + 2, 1), round(g3() + 1, 1), round(g3() + 3, 1)];
export const MSE_TRUE = [2, 1, 3];
export const MSE = MSE_PRED.reduce((s, p, i) => s + (p - MSE_TRUE[i]) ** 2, 0) / MSE_PRED.length;

// --- Chapter 4: training loop on a linear model (full-batch GD on MSE) --------------------
const g4 = gauss(44);
const N = 32;
export const W_TRUE = [1.5, -2.0];
export const B_TRUE = 0.5;
const TX: Mat = Array.from({ length: N }, () => [g4(), g4()]);
const TY = TX.map((x) => x[0] * W_TRUE[0] + x[1] * W_TRUE[1] + B_TRUE + 0.1 * g4());
export const LR = 0.1;
export const EPOCHS = 40;
function train(zeroGrad: boolean) {
  let w = [0, 0];
  let b = 0;
  let gw = [0, 0];
  let gb = 0;
  const losses: number[] = [];
  const ws: number[][] = [];
  for (let e = 0; e < EPOCHS; e++) {
    const err = TX.map((x, i) => x[0] * w[0] + x[1] * w[1] + b - TY[i]);
    losses.push(err.reduce((s, v) => s + v * v, 0) / N);
    ws.push([...w, b]);
    if (zeroGrad) {
      gw = [0, 0];
      gb = 0;
    }
    // backward: .grad += dL/dparam
    gw = gw.map((g, j) => g + (2 / N) * err.reduce((s, v, i) => s + v * TX[i][j], 0));
    gb += (2 / N) * err.reduce((s, v) => s + v, 0);
    w = w.map((wj, j) => wj - LR * gw[j]);
    b -= LR * gb;
  }
  return { losses, ws, w, b };
}
export const GOOD = train(true);
export const BUGGY = train(false);

// --- Chapter 5: minibatches ----------------------------------------------------------------
export const DN = 10;
export const BATCH = 4;
const r5 = rng(0);
const perm = Array.from({ length: DN }, (_, i) => i);
for (let i = DN - 1; i > 0; i--) {
  const j = Math.floor(r5() * (i + 1));
  [perm[i], perm[j]] = [perm[j], perm[i]];
}
export const PERM = perm; // a seeded shuffle (Fisher-Yates on mulberry32)
export const BATCHES = Array.from({ length: Math.ceil(DN / BATCH) }, (_, k) => PERM.slice(k * BATCH, (k + 1) * BATCH));
const g5 = gauss(55);
export const DX = Array.from({ length: DN }, () => round(g5(), 1));
export const DY = Array.from({ length: DN }, () => (r5() > 0.5 ? 1 : 0));
