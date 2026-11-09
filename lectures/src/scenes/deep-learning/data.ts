// Every number on screen in the Deep Learning Basics lecture comes from here.
import { gauss, matmul, rng, softmax, type Mat } from '../../lib/math';

export const relu = (x: number) => Math.max(0, x);
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const dRelu = (x: number) => (x > 0 ? 1 : 0);
export const dSigmoid = (x: number) => sigmoid(x) * (1 - sigmoid(x));
export const dTanh = (x: number) => 1 - Math.tanh(x) ** 2;

// --- Chapter 1: one neuron ------------------------------------------------------
const g1 = gauss(9);
const r2 = (v: number) => Math.round(v * 10) / 10;
export const NEURON_X = [r2(1.2 * g1()), r2(1.2 * g1()), r2(1.2 * g1())];
export const NEURON_W = [r2(g1()), r2(g1()), r2(g1())];
export const NEURON_B = r2(0.5 * g1());
export const NEURON_Z = NEURON_X.reduce((a, x, i) => a + x * NEURON_W[i], NEURON_B);
export const NEURON_A = relu(NEURON_Z);

// two stacked linear layers collapse into one
const gc = gauss(8);
export const L1: Mat = Array.from({ length: 2 }, () => Array.from({ length: 3 }, () => r2(gc())));
export const L2: Mat = Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => r2(gc())));
export const L12 = matmul(L1, L2);

// two rings: inner (label 1) and outer (label 0)
export const N_RING = 240;
const rr = rng(17);
const gr = gauss(18);
export const RINGS = Array.from({ length: N_RING }, (_, i) => {
  const inner = i % 2 === 0;
  const a = rr() * 2 * Math.PI;
  const r = (inner ? 0.45 : 1.15) + 0.12 * gr();
  return { x: r * Math.cos(a), y: r * Math.sin(a), label: inner ? 1 : 0 };
});

// logistic regression (linear boundary), full-batch gradient descent
function trainLinear() {
  let w0 = 0, w1 = 0, b = 0;
  for (let it = 0; it < 2000; it++) {
    let g0 = 0, g1_ = 0, gb = 0;
    for (const p of RINGS) {
      const e = sigmoid(w0 * p.x + w1 * p.y + b) - p.label;
      g0 += e * p.x; g1_ += e * p.y; gb += e;
    }
    const lr = 0.5 / N_RING;
    w0 -= lr * g0; w1 -= lr * g1_; b -= lr * gb;
  }
  return (x: number, y: number) => sigmoid(w0 * x + w1 * y + b);
}

// 2 -> H (ReLU) -> 1 (sigmoid), full-batch gradient descent on binary cross-entropy
export const HIDDEN = 8;
function trainMLP() {
  const g = gauss(29);
  const W1 = Array.from({ length: HIDDEN }, () => [g(), g()]);
  const b1 = new Array(HIDDEN).fill(0.1);
  const W2 = Array.from({ length: HIDDEN }, () => g() * 0.5);
  let b2 = 0;
  const lr = 0.3;
  for (let it = 0; it < 3000; it++) {
    const gW1 = W1.map(() => [0, 0]);
    const gb1 = new Array(HIDDEN).fill(0);
    const gW2 = new Array(HIDDEN).fill(0);
    let gb2 = 0;
    for (const p of RINGS) {
      const z = W1.map((w, h) => w[0] * p.x + w[1] * p.y + b1[h]);
      const a = z.map(relu);
      const out = sigmoid(a.reduce((s, v, h) => s + v * W2[h], b2));
      const e = out - p.label;
      gb2 += e;
      for (let h = 0; h < HIDDEN; h++) {
        gW2[h] += e * a[h];
        const d = z[h] > 0 ? e * W2[h] : 0;
        gW1[h][0] += d * p.x; gW1[h][1] += d * p.y; gb1[h] += d;
      }
    }
    const s = lr / N_RING;
    for (let h = 0; h < HIDDEN; h++) {
      W1[h][0] -= s * gW1[h][0]; W1[h][1] -= s * gW1[h][1]; b1[h] -= s * gb1[h]; W2[h] -= s * gW2[h];
    }
    b2 -= s * gb2;
  }
  return (x: number, y: number) => sigmoid(W1.reduce((acc, w, h) => acc + relu(w[0] * x + w[1] * y + b1[h]) * W2[h], b2));
}
export const LINEAR = trainLinear();
export const MLP = trainMLP();
const acc = (f: (x: number, y: number) => number) => RINGS.filter((p) => (f(p.x, p.y) >= 0.5 ? 1 : 0) === p.label).length / N_RING;
export const ACC_LINEAR = acc(LINEAR);
export const ACC_MLP = acc(MLP);
/** probability grids over [-1.8, 1.8]^2 for the decision-boundary heatmaps */
export const GRID = 48;
export const EXTENT = 1.8;
const grid = (f: (x: number, y: number) => number) =>
  Array.from({ length: GRID }, (_, i) =>
    Array.from({ length: GRID }, (_, j) => f(-EXTENT + ((j + 0.5) / GRID) * 2 * EXTENT, EXTENT - ((i + 0.5) / GRID) * 2 * EXTENT)),
  );
export const GRID_LINEAR = grid(LINEAR);
export const GRID_MLP = grid(MLP);

// --- Chapter 2: vanishing gradients through 10 layers ------------------------------
export const DEPTH = 10;
export const SIG_MAX_SLOPE = dSigmoid(0); // 0.25
export const SIG_CHAIN = Array.from({ length: DEPTH }, (_, i) => SIG_MAX_SLOPE ** (i + 1));

// --- Chapter 3: a dense layer on a batch of 3 examples, 4 -> 3 ---------------------
const g3 = gauss(12);
export const X: Mat = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => r2(g3())));
export const W: Mat = Array.from({ length: 4 }, () => Array.from({ length: 3 }, () => r2(0.7 * g3())));
export const B = [r2(0.5 * g3()), r2(0.5 * g3()), r2(0.5 * g3())];
export const XW = matmul(X, W);
export const Z = XW.map((row) => row.map((v, j) => v + B[j]));
export const A = Z.map((row) => row.map(relu));

// --- Chapter 4: softmax ---------------------------------------------------------------
const g4 = gauss(4);
export const LOGITS = [r2(1.5 * g4()), r2(1.5 * g4()), r2(1.5 * g4()), r2(1.5 * g4())];
export const EXPS = LOGITS.map(Math.exp);
export const EXP_SUM = EXPS.reduce((a, b) => a + b, 0);
export const PROBS = EXPS.map((e) => e / EXP_SUM);
export const BIG = LOGITS.map((v) => v + 1000);
export const BIG_EXPS = BIG.map(Math.exp); // Infinity in float64
export const BIG_NAIVE = BIG_EXPS.map((e) => e / BIG_EXPS.reduce((a, b) => a + b, 0)); // NaN
export const BIG_MAX = Math.max(...BIG);
export const BIG_SHIFTED = BIG.map((v) => v - BIG_MAX);
export const BIG_STABLE = softmax(BIG); // lib softmax subtracts the max
