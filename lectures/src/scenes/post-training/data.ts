// Every number on screen in the Post-training lecture comes from here.
import { gauss, rng, type Mat } from '../../lib/math';

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
/** population standard deviation (ddof = 0), as in the problem */
const pstd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
};
export const GRPO_EPS = 1e-8;
export const groupAdvantages = (r: number[]) => {
  const m = mean(r);
  const s = pstd(r);
  return { mean: m, std: s, adv: r.map((x) => (x - m) / (s + GRPO_EPS)) };
};

// --- Chapter 2: a group of 8 verifiable rewards ----------------------------
export const G = 8;
const gr = rng(8);
/** 1 = the checker accepts the answer; seeded, a mostly-wrong group */
export const GROUP_R = Array.from({ length: G }, () => (gr() < 0.35 ? 1 : 0));
export const GROUP = groupAdvantages(GROUP_R);
export const GROUP_SAME = groupAdvantages(new Array(G).fill(1));

// --- Chapter 3: per-token objective for one prompt, 4 responses x 6 tokens --
export const G3 = 4;
export const T3 = 6;
export const BETA = 0.04;
export const CLIP_EPS = 0.2;
export const R3 = [1, 0, 0, 1];
export const ADV3 = groupAdvantages(R3).adv;
export const LENGTHS = [6, 4, 5, 3];
export const MASK: Mat = LENGTHS.map((L) => Array.from({ length: T3 }, (_, t) => (t < L ? 1 : 0)));
const g3 = gauss(303);
export const LOGP: Mat = Array.from({ length: G3 }, () => Array.from({ length: T3 }, () => -0.4 - Math.abs(g3()) * 1.2));
export const OLD_LOGP: Mat = LOGP.map((r) => r.map((v) => v - g3() * 0.15));
export const REF_LOGP: Mat = LOGP.map((r) => r.map((v) => v - g3() * 0.3));
const clip = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const RATIO: Mat = LOGP.map((r, i) => r.map((v, t) => Math.exp(v - OLD_LOGP[i][t])));
export const SURR: Mat = RATIO.map((r, i) => r.map((q) => Math.min(q * ADV3[i], clip(q, 1 - CLIP_EPS, 1 + CLIP_EPS) * ADV3[i])));
export const k3 = (d: number) => Math.exp(d) - d - 1;
export const KL3: Mat = LOGP.map((r, i) => r.map((v, t) => k3(REF_LOGP[i][t] - v)));
export const PER_TOKEN: Mat = SURR.map((r, i) => r.map((s, t) => s - BETA * KL3[i][t]));
export const ROW_MEAN = PER_TOKEN.map((r, i) => r.reduce((a, v, t) => a + v * MASK[i][t], 0) / LENGTHS[i]);
export const OBJECTIVE = mean(ROW_MEAN);
export const MEAN_KL = mean(KL3.map((r, i) => r.reduce((a, v, t) => a + v * MASK[i][t], 0) / LENGTHS[i]));

// --- Chapter 4: absmax quantization of one weight row ----------------------
export const PARAMS = 7e9;
export const GB_FP32 = (PARAMS * 4) / 1e9;
export const GB_INT8 = (PARAMS * 1) / 1e9;
const g4 = gauss(41);
export const W_ROW = Array.from({ length: 8 }, () => Math.round(g4() * 0.6 * 1000) / 1000);
export const ABSMAX = Math.max(...W_ROW.map(Math.abs));
export const SCALE = ABSMAX / 127;
/** numpy rounds half to even */
export const roundHalfEven = (x: number) => {
  const f = Math.floor(x);
  const d = x - f;
  if (Math.abs(d - 0.5) < 1e-12) return f % 2 === 0 ? f : f + 1;
  return Math.round(x);
};
export const quant = (w: number, s: number) => clip(roundHalfEven(w / s), -127, 127);
export const W_DIV = W_ROW.map((w) => w / SCALE);
export const W_Q = W_ROW.map((w) => quant(w, SCALE));
export const W_HAT = W_Q.map((q) => q * SCALE);
export const W_ERR = W_ROW.map((w, i) => Math.abs(w - W_HAT[i]));

// --- Chapter 5: per-tensor vs per-channel, then an int8 matmul -------------
const g5 = gauss(55);
export const W5: Mat = Array.from({ length: 4 }, () => Array.from({ length: 6 }, () => Math.round(g5() * 0.15 * 100) / 100));
W5[2][4] = 3.2; // one outlier weight, as LLM weights have
const absmax = (v: number[]) => Math.max(...v.map(Math.abs));
export const S_TENSOR = Math.max(absmax(W5.flat()), 1e-8) / 127;
export const S_CHANNEL = W5.map((r) => Math.max(absmax(r), 1e-8) / 127);
export const Q_TENSOR: Mat = W5.map((r) => r.map((w) => quant(w, S_TENSOR)));
export const Q_CHANNEL: Mat = W5.map((r, i) => r.map((w) => quant(w, S_CHANNEL[i])));
export const ERR_TENSOR = Math.max(...W5.flatMap((r, i) => r.map((w, j) => Math.abs(w - Q_TENSOR[i][j] * S_TENSOR))));
export const ERR_CHANNEL = Math.max(...W5.flatMap((r, i) => r.map((w, j) => Math.abs(w - Q_CHANNEL[i][j] * S_CHANNEL[i]))));
/** worst rounding error in each row, for both schemes */
export const ROW_ERR_TENSOR = W5.map((r, i) => Math.max(...r.map((w, j) => Math.abs(w - Q_TENSOR[i][j] * S_TENSOR))));
export const ROW_ERR_CHANNEL = W5.map((r, i) => Math.max(...r.map((w, j) => Math.abs(w - Q_CHANNEL[i][j] * S_CHANNEL[i]))));

export const X5 = [Array.from({ length: 6 }, () => Math.round(g5() * 100) / 100)];
export const S_X = X5.map((r) => Math.max(absmax(r), 1e-8) / 127);
export const X_Q: Mat = X5.map((r, i) => r.map((v) => quant(v, S_X[i])));
export const ACC: Mat = X_Q.map((xr) => Q_CHANNEL.map((wr) => wr.reduce((a, w, j) => a + w * xr[j], 0)));
export const Y_INT8: Mat = ACC.map((r, i) => r.map((a, o) => a * S_X[i] * S_CHANNEL[o]));
export const Y_EXACT: Mat = X5.map((xr) => W5.map((wr) => wr.reduce((a, w, j) => a + w * xr[j], 0)));
export const Y_ERR = Math.max(...Y_EXACT[0].map((v, o) => Math.abs(v - Y_INT8[0][o])));
