// Every number on screen in the LLM Internals lecture comes from here.
import { gauss, matmul, mean, randn, softmax, type Mat } from '../../lib/math';

// --- Chapter 1: RMSNorm vs LayerNorm on one token vector --------------------
const g1 = gauss(41);
export const RMS_X: number[] = Array.from({ length: 6 }, () => g1() * 1.4 + 1.1);
export const RMS = Math.sqrt(mean(RMS_X.map((v) => v * v)) + 1e-6);
export const RMS_OUT = RMS_X.map((v) => v / RMS);
export const RMS_OUT_MS = mean(RMS_OUT.map((v) => v * v));
export const X_MEAN = mean(RMS_X);
export const RMS_OUT_MEAN = mean(RMS_OUT);

// --- Chapter 2: SiLU and the SwiGLU gate ------------------------------------
export const silu = (z: number) => z / (1 + Math.exp(-z));
export const relu = (z: number) => Math.max(0, z);
export const SILU_MIN = (() => {
  let best = { z: 0, v: 0 };
  for (let z = -6; z <= 0; z += 0.001) if (silu(z) < best.v) best = { z, v: silu(z) };
  return best;
})();
export const D_MODEL = 4;
export const D_FF = 8;
const g2 = gauss(5);
export const SW_X: Mat = randn(g2, 1, D_MODEL);
const W_GATE: Mat = randn(g2, D_MODEL, D_FF, 1);
const W_UP: Mat = randn(g2, D_MODEL, D_FF, 1 / Math.sqrt(D_MODEL));
export const PRE_GATE = matmul(SW_X, W_GATE)[0];
export const GATE = PRE_GATE.map(silu);
export const UP = matmul(SW_X, W_UP)[0];
export const GATED = GATE.map((g, i) => g * UP[i]);
/** parameter counts for a LLaMA-7B-sized model dimension */
export const D_BIG = 4096;
export const RELU_PARAMS = 2 * D_BIG * 4 * D_BIG;
export const DFF_SWIGLU = Math.round(((2 / 3) * 4 * D_BIG));
export const SWIGLU_PARAMS = 3 * D_BIG * DFF_SWIGLU;

// --- Chapter 3: online softmax over 12 scores in blocks of 4 ----------------
const g3 = gauss(77);
export const OS_X: number[] = Array.from({ length: 12 }, (_, i) => g3() * 1.5 + (i >= 4 && i < 8 ? 1.6 : 0));
export const OS_B = 4;
export const OS_STEPS = (() => {
  let m = -Infinity;
  let l = 0;
  const out: { block: number; mOld: number; m: number; scale: number; l: number }[] = [];
  for (let b = 0; b < OS_X.length / OS_B; b++) {
    const blk = OS_X.slice(b * OS_B, (b + 1) * OS_B);
    const mNew = Math.max(m, ...blk);
    const scale = Number.isFinite(m) ? Math.exp(m - mNew) : 0;
    l = l * scale + blk.reduce((s, v) => s + Math.exp(v - mNew), 0);
    out.push({ block: b, mOld: m, m: mNew, scale, l });
    m = mNew;
  }
  return out;
})();
const last = OS_STEPS[OS_STEPS.length - 1];
export const OS_P = OS_X.map((v) => Math.exp(v - last.m) / last.l);
export const OS_EXACT = softmax(OS_X);
export const OS_MAXERR = Math.max(...OS_P.map((p, i) => Math.abs(p - OS_EXACT[i])));

// --- Chapter 4: mixture-of-experts routing, T = 6 tokens, E = 4, top-2 -------
export const MOE_TOKENS = ['The', 'cat', 'sat', 'on', 'a', 'mat'];
export const E = 4;
export const TOPK = 2;
const g4 = gauss(64);
const MX: Mat = randn(g4, MOE_TOKENS.length, 4);
const WR: Mat = randn(g4, 4, E, 0.9);
export const ROUTER_LOGITS = matmul(MX, WR);
export const ROUTER_P = ROUTER_LOGITS.map(softmax);
export const TOP_IDX = ROUTER_LOGITS.map((row) =>
  row
    .map((v, e) => [v, e] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, TOPK)
    .map((x) => x[1]),
);
export const GATES = ROUTER_LOGITS.map((row, t) => softmax(TOP_IDX[t].map((e) => row[e])));
function auxLoss(idx: number[][], probs: Mat) {
  const T = idx.length;
  const k = idx[0].length;
  const f = Array.from({ length: E }, (_, e) => idx.flat().filter((x) => x === e).length / (T * k));
  const P = Array.from({ length: E }, (_, e) => mean(probs.map((r) => r[e])));
  return { f, P, loss: E * f.reduce((s, fe, e) => s + fe * P[e], 0) };
}
export const AUX = auxLoss(TOP_IDX, ROUTER_P);
/** a collapsed router: the same logits with a large bias toward expert 0 and 1 */
const COLLAPSED_LOGITS = ROUTER_LOGITS.map((r) => r.map((v, e) => v + (e === 0 ? 6 : e === 1 ? 4 : 0)));
const COLLAPSED_IDX = COLLAPSED_LOGITS.map((row) =>
  row
    .map((v, e) => [v, e] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, TOPK)
    .map((x) => x[1]),
);
export const AUX_COLLAPSED = auxLoss(COLLAPSED_IDX, COLLAPSED_LOGITS.map(softmax));
/** perfectly uniform routing gives exactly 1 */
export const AUX_UNIFORM = E * Array.from({ length: E }, () => (1 / E) * (1 / E)).reduce((a, b) => a + b, 0);

// --- Chapter 5: cross-entropy and perplexity --------------------------------
export const PPL_TOKENS = ['the', 'cat', 'sat', 'on', 'the', 'mat', '<pad>', '<pad>'];
export const PPL_MASK: number[] = PPL_TOKENS.map((t) => (t === '<pad>' ? 0 : 1));
export const V = 8;
const g5 = gauss(8);
const PPL_TARGETS = [1, 2, 3, 0, 4, 5, 7, 7];
// logits with a bump on the correct token so the model is decent but not perfect
const PPL_LOGITS: Mat = PPL_TARGETS.map((t) => Array.from({ length: V }, (_, v) => g5() + (v === t ? 2.2 : 0)));
export const PPL_P_TRUE = PPL_LOGITS.map((row, i) => softmax(row)[PPL_TARGETS[i]]);
export const TOKEN_NLL = PPL_P_TRUE.map((p, i) => (PPL_MASK[i] ? -Math.log(p) : 0));
export const MEAN_NLL = TOKEN_NLL.reduce((a, b) => a + b, 0) / PPL_MASK.reduce((a, b) => a + b, 0);
export const PERPLEXITY = Math.exp(MEAN_NLL);
/** what you'd get if padding were (wrongly) averaged in */
export const NLL_UNMASKED = PPL_P_TRUE.map((p) => -Math.log(p)).reduce((a, b) => a + b, 0) / PPL_TOKENS.length;
export const PPL_UNIFORM = Math.exp(-Math.log(1 / V));
