// Every number on screen in the Transformers lecture comes from here.
import {
  add,
  causalMask,
  dot,
  gauss,
  layerNormRow,
  matmul,
  positionalEncoding,
  randn,
  scale,
  softmax,
  softmaxJacobianNorm,
  softmaxRows,
  transpose,
  variance,
  type Mat,
} from '../../lib/math';

// --- Chapter 1: a 4-token example, d_model = d_k = 4 -----------------------
export const TOKENS = ['the', 'trophy', 'was', 'big'];
export const DK = 4;
const g1 = gauss(7);
export const X: Mat = randn(g1, 4, DK);
export const WQ: Mat = randn(g1, DK, DK, 1 / Math.sqrt(DK));
export const WK: Mat = randn(g1, DK, DK, 1 / Math.sqrt(DK));
export const WV: Mat = randn(g1, DK, DK, 1 / Math.sqrt(DK));
export const Q = matmul(X, WQ);
export const K = matmul(X, WK);
export const V = matmul(X, WV);
export const KT = transpose(K);
/** raw dot-product scores QK^T (chapter 1 introduces these before scaling) */
export const S_RAW = matmul(Q, KT);
export const A_RAW = softmaxRows(S_RAW);
export const O_RAW = matmul(A_RAW, V);
/** scaled scores QK^T / sqrt(d_k) */
export const S = scale(S_RAW, 1 / Math.sqrt(DK));

// --- Chapter 2: why we scale ------------------------------------------------
export const DK_STEPS = [4, 16, 64, 256];
const N_SAMPLES = 4000;
export const HIST_RANGE = 48; // x axis spans [-48, 48]
export const HIST_BINS = 96;
function histogram(xs: number[]) {
  const bins = new Array(HIST_BINS).fill(0);
  const w = (2 * HIST_RANGE) / HIST_BINS;
  for (const x of xs) {
    const b = Math.floor((x + HIST_RANGE) / w);
    if (b >= 0 && b < HIST_BINS) bins[b]++;
  }
  return bins.map((c) => c / xs.length);
}
export const N_KEYS = 8;
// One query and 8 keys drawn once at d = 256; each d_k step uses their first
// d_k entries, so the scores are real dot products that grow with d_k.
// (Seed picked so the example shows the typical trend cleanly.)
const gq = gauss(514);
const Q256 = Array.from({ length: 256 }, () => gq());
const KEYS256 = Array.from({ length: N_KEYS }, () => Array.from({ length: 256 }, () => gq()));
export const SCALING = DK_STEPS.map((dk, si) => {
  const g = gauss(100 + si);
  // distribution of q.k for unit-variance, independent entries
  const raw: number[] = [];
  for (let n = 0; n < N_SAMPLES; n++) {
    let s = 0;
    for (let d = 0; d < dk; d++) s += g() * g();
    raw.push(s);
  }
  const scaled = raw.map((x) => x / Math.sqrt(dk));
  const scores = KEYS256.map((k) => dot(Q256.slice(0, dk), k.slice(0, dk)));
  const pRaw = softmax(scores);
  const pScaled = softmax(scores.map((s) => s / Math.sqrt(dk)));
  return {
    dk,
    varRaw: variance(raw),
    varScaled: variance(scaled),
    histRaw: histogram(raw),
    histScaled: histogram(scaled),
    pRaw,
    pScaled,
    gradRaw: softmaxJacobianNorm(pRaw),
    gradScaled: softmaxJacobianNorm(pScaled),
  };
});

// --- Chapter 3: multi-head, d_model = 8, h = 4, d_head = 2 ------------------
export const D_MODEL = 8;
export const HEADS = 4;
export const D_HEAD = D_MODEL / HEADS;
const g3 = gauss(31);
export const X8: Mat = randn(g3, 4, D_MODEL);
export const HEAD_DATA = Array.from({ length: HEADS }, () => {
  const wq = randn(g3, D_MODEL, D_HEAD, 1 / Math.sqrt(D_MODEL));
  const wk = randn(g3, D_MODEL, D_HEAD, 1 / Math.sqrt(D_MODEL));
  const wv = randn(g3, D_MODEL, D_HEAD, 1 / Math.sqrt(D_MODEL));
  // larger logits so each head shows a distinct pattern
  const q = scale(matmul(X8, wq), 2.2);
  const k = scale(matmul(X8, wk), 2.2);
  const v = matmul(X8, wv);
  const a = softmaxRows(scale(matmul(q, transpose(k)), 1 / Math.sqrt(D_HEAD)));
  return { a, out: matmul(a, v) };
});
export const CONCAT: Mat = X8.map((_, i) => HEAD_DATA.flatMap((h) => h.out[i]));
export const WO: Mat = randn(g3, D_MODEL, D_MODEL, 1 / Math.sqrt(D_MODEL));
export const MH_OUT = matmul(CONCAT, WO);

// --- Chapter 4: positional encoding ----------------------------------------
export const PE_POS = 48;
export const PE_D = 32;
export const PE: Mat = positionalEncoding(PE_POS, PE_D);
/** Permutation equivariance: attention without positions on X, then on shuffled X. */
export const PERM = [2, 0, 3, 1];
const attn = (x: Mat) => matmul(softmaxRows(scale(matmul(matmul(x, WQ), transpose(matmul(x, WK))), 1 / Math.sqrt(DK))), matmul(x, WV));
export const OUT_ORDERED = attn(X);
export const OUT_SHUFFLED = attn(PERM.map((p) => X[p]));
export const PERM_MAX_ERR = Math.max(
  ...OUT_SHUFFLED.flatMap((row, i) => row.map((v, j) => Math.abs(v - OUT_ORDERED[PERM[i]][j]))),
);
export const PE4 = positionalEncoding(4, DK);
export const X_PLUS_PE = add(X, PE4);

// --- Chapter 5: layer norm and the causal mask ------------------------------
const g5 = gauss(55);
export const LN_FEATURES = 6;
export const LN_X: Mat = randn(g5, 4, LN_FEATURES, 1.6).map((r, i) => r.map((v) => v + [1.5, -0.8, 3.0, 0.4][i]));
export const LN = LN_X.map((r) => layerNormRow(r));
export const MASK = causalMask(4);
export const S_MASKED = add(S, MASK);
export const A_CAUSAL = softmaxRows(S_MASKED);
export const A_UNMASKED = softmaxRows(S);
