// Every number on screen in the Sequence Models lecture comes from here.
import { gauss, matmul, randn, transpose, type Mat } from '../../lib/math';

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const vecMat = (v: number[], m: Mat) => m[0].map((_, j) => v.reduce((s, x, k) => s + x * m[k][j], 0));
const addV = (...vs: number[][]) => vs[0].map((_, i) => vs.reduce((s, v) => s + v[i], 0));

// --- Chapter 1: a vanilla RNN over 5 tokens, D = 2, H = 3 --------------------
export const TOKENS = ['the', 'cat', 'sat', 'on', 'mats'];
export const D = 2;
export const H = 3;
const g1 = gauss(12);
export const XS: Mat = randn(g1, TOKENS.length, D);
export const W_XH: Mat = randn(g1, D, H, 0.5);
export const W_HH: Mat = randn(g1, H, H, 0.5);
export const B: number[] = randn(g1, 1, H, 0.2)[0];
/** The Vanilla RNN problem: h_t = tanh(x_t W_xh + h_{t-1} W_hh + b), h_0 = 0 */
export function rnnForward(xs: Mat, wxh: Mat, whh: Mat, b: number[], h0: number[]) {
  const hs: number[][] = [];
  let h = h0;
  for (const x of xs) {
    h = addV(vecMat(x, wxh), vecMat(h, whh), b).map(Math.tanh);
    hs.push(h);
  }
  return hs;
}
export const HS = rnnForward(XS, W_XH, W_HH, B, new Array(H).fill(0));

// --- Chapter 2: how the gradient norm decays / grows through time -------------
// H = 16, T = 50 steps; W_hh rescaled so its largest singular value is sigma.
export const T_LONG = 50;
const H2 = 16;
function largestSingular(m: Mat): number {
  // power iteration on m^T m
  const mtm = matmul(transpose(m), m);
  let v = new Array(m[0].length).fill(1);
  for (let k = 0; k < 200; k++) {
    const w = vecMat(v, mtm);
    const n = Math.hypot(...w);
    v = w.map((x) => x / n);
  }
  return Math.sqrt(Math.hypot(...vecMat(v, mtm)));
}
const g2 = gauss(5);
const BASE: Mat = randn(g2, H2, H2);
const BASE_SIGMA = largestSingular(BASE);
const XS2: Mat = randn(g2, T_LONG, H2, 0.05);
export const SIGMAS = [0.8, 4];
/**
 * For each sigma: ||dh_T / dh_t|| for t = T..1, from the actual Jacobian product
 * prod diag(1 - h^2) W_hh^T along a forward pass (inputs projected by identity).
 */
export const GRAD_FLOW = SIGMAS.map((sigma) => {
  const whh = BASE.map((r) => r.map((v) => (v * sigma) / BASE_SIGMA));
  let h = new Array(H2).fill(0);
  const hs: number[][] = [];
  for (const x of XS2) {
    h = addV(x, vecMat(h, whh)).map(Math.tanh);
    hs.push(h);
  }
  // J = dh_T/dh_t, start with identity at t = T; dh_t/dh_{t-1} = diag(1 - h_t^2) W_hh^T (row-vector convention: h_t = tanh(h_{t-1} W_hh + ...))
  let J: Mat = Array.from({ length: H2 }, (_, i) => Array.from({ length: H2 }, (_, j) => (i === j ? 1 : 0)));
  const norms: number[] = [];
  const fro = (m: Mat) => Math.sqrt(m.flat().reduce((s, v) => s + v * v, 0) / H2);
  norms.push(fro(J));
  for (let t = T_LONG - 1; t > 0; t--) {
    const d = hs[t].map((v) => 1 - v * v);
    // dh_t / dh_{t-1}[i][j] = W_hh[i][j] * d[j]  (h_{t-1} index i, h_t index j)
    const step: Mat = whh.map((row) => row.map((v, j) => v * d[j]));
    J = matmul(step, J);
    norms.push(fro(J));
  }
  return { sigma, norms };
});

// --- Chapter 3: one LSTM step, H = 4, D = 3 (PyTorch layout, gate order i, f, g, o)
export const LH = 4;
const LD = 3;
const g3 = gauss(33);
const lx = randn(g3, 1, LD)[0];
const lh = randn(g3, 1, LH, 0.5)[0];
export const C_PREV = randn(g3, 1, LH, 0.8)[0];
const W_IH: Mat = randn(g3, 4 * LH, LD, 0.5);
const W_HH4: Mat = randn(g3, 4 * LH, LH, 0.5);
const B_IH = randn(g3, 1, 4 * LH, 0.2)[0];
// forget-gate bias initialised to 1, as is common
const B_HH = randn(g3, 1, 4 * LH, 0.2)[0].map((v, k) => (k >= LH && k < 2 * LH ? v + 1 : v));
const gatesPre = addV(vecMat(lx, transpose(W_IH)), B_IH, vecMat(lh, transpose(W_HH4)), B_HH);
const chunk = (v: number[], k: number) => v.slice(k * LH, (k + 1) * LH);
export const LSTM = (() => {
  const i = chunk(gatesPre, 0).map(sigmoid);
  const f = chunk(gatesPre, 1).map(sigmoid);
  const g = chunk(gatesPre, 2).map(Math.tanh);
  const o = chunk(gatesPre, 3).map(sigmoid);
  const c = f.map((fv, k) => fv * C_PREV[k] + i[k] * g[k]);
  const h = o.map((ov, k) => ov * Math.tanh(c[k]));
  return { i, f, g, o, c, h };
})();
/** Gradient through the cell over many steps: product of forget-gate values. */
export const F_STEPS = 100;
export const forgetProduct = (f: number, n: number) => f ** n;

// --- Chapter 4: one GRU step, H = 4, D = 3 (gate order r, z, n) ---------------
const g4 = gauss(44);
const gx = randn(g4, 1, LD)[0];
export const GH_PREV = randn(g4, 1, LH, 0.7)[0];
const GW_IH: Mat = randn(g4, 3 * LH, LD, 0.6);
const GW_HH: Mat = randn(g4, 3 * LH, LH, 0.6);
const GB_IH = randn(g4, 1, 3 * LH, 0.2)[0];
const GB_HH = randn(g4, 1, 3 * LH, 0.2)[0];
export const GRU = (() => {
  const gi = addV(vecMat(gx, transpose(GW_IH)), GB_IH);
  const gh = addV(vecMat(GH_PREV, transpose(GW_HH)), GB_HH);
  const c3 = (v: number[], k: number) => v.slice(k * LH, (k + 1) * LH);
  const r = addV(c3(gi, 0), c3(gh, 0)).map(sigmoid);
  const z = addV(c3(gi, 1), c3(gh, 1)).map(sigmoid);
  const n = c3(gi, 2).map((v, k) => Math.tanh(v + r[k] * c3(gh, 2)[k]));
  const h = n.map((nv, k) => (1 - z[k]) * nv + z[k] * GH_PREV[k]);
  return { r, z, n, h };
})();
export const PARAM_HD = { h: 256, d: 256 };
export const cellParams = (blocks: number, h = PARAM_HD.h, d = PARAM_HD.d) => blocks * (h * d + h * h + 2 * h);

// --- Chapter 5: per-token memory at generation time ---------------------------
// One layer, d_model = 1024, fp16: an RNN keeps its state; a transformer keeps K and V for every past token.
export const MEM = { d: 1024, bytes: 2 };
export const rnnStateBytes = () => MEM.d * MEM.bytes;
export const kvCacheBytes = (t: number) => 2 * t * MEM.d * MEM.bytes;
export const MEM_T = [0, 1024, 2048, 3072, 4096];
