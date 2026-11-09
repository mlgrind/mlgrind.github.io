// Every number on screen in the Generative Models lecture comes from here.
import { gauss, mean, rng } from '../../lib/math';

// --- Chapter 1: KL divergence between two Gaussians -------------------------
export const klGauss = (mp: number, sp: number, mq: number, sq: number) =>
  Math.log(sq / sp) + (sp * sp + (mp - mq) ** 2) / (2 * sq * sq) - 0.5;
export const pdf = (x: number, m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
export const P_DIST = { m: 0, s: 1 };
export const Q_DIST = { m: 1.5, s: 0.6 };
export const KL_PQ = klGauss(P_DIST.m, P_DIST.s, Q_DIST.m, Q_DIST.s);
export const KL_QP = klGauss(Q_DIST.m, Q_DIST.s, P_DIST.m, P_DIST.s);

// --- Chapter 2: VAE reparameterization and loss ----------------------------
/** one input's 2-D latent posterior */
const g2e = gauss(212);
/** example encoder outputs for one input (seeded) */
export const MU = [g2e() * 0.8, g2e() * 0.8];
export const LOGVAR = [-0.6 + g2e() * 0.5, -0.6 + g2e() * 0.5];
export const SIGMA = LOGVAR.map((lv) => Math.exp(0.5 * lv));
const g2 = gauss(21);
export const EPS = Array.from({ length: 40 }, () => [g2(), g2()]);
export const Z = EPS.map((e) => e.map((v, i) => MU[i] + SIGMA[i] * v));
/** KL to N(0, I), summed over latent dims */
export const KL_TERMS = MU.map((m, i) => -0.5 * (1 + LOGVAR[i] - m * m - Math.exp(LOGVAR[i])));
export const KL_VAE = KL_TERMS.reduce((a, b) => a + b, 0);
// a toy 8-pixel input and an imperfect reconstruction
const g2b = gauss(5);
export const X_IN = Array.from({ length: 8 }, (_, i) => Math.round((0.5 + 0.4 * Math.sin(i * 0.9)) * 100) / 100);
export const X_REC = X_IN.map((v) => v + 0.08 * g2b());
export const RECON = mean(X_IN.map((v, i) => (v - X_REC[i]) ** 2));

// --- Chapter 3: VQ-VAE nearest-codebook quantization ------------------------
const g3 = gauss(13);
export const CODEBOOK = Array.from({ length: 6 }, () => [g3() * 0.9, g3() * 0.9]);
export const Z_E = Array.from({ length: 16 }, () => [g3() * 0.95, g3() * 0.95]);
const sq = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
export const CODES = Z_E.map((z) => CODEBOOK.reduce((best, c, k) => (sq(z, c) < sq(z, CODEBOOK[best]) ? k : best), 0));
export const CODE_DIST = Z_E.map((z, i) => sq(z, CODEBOOK[CODES[i]]));

// --- Chapter 4: diffusion schedule and forward process ---------------------
export const T = 1000;
export const BETA_START = 1e-4;
export const BETA_END = 0.02;
export const BETAS = Array.from({ length: T }, (_, t) => BETA_START + (t * (BETA_END - BETA_START)) / (T - 1));
export const ALPHA_BAR: number[] = [];
BETAS.reduce((acc, b) => {
  const v = acc * (1 - b);
  ALPHA_BAR.push(v);
  return v;
}, 1);
/** data: a 2-D spiral of 160 points */
export const SPIRAL = Array.from({ length: 160 }, (_, i) => {
  const t = 0.6 + (i / 160) * 3.4 * Math.PI;
  const r = 0.12 * t;
  return [r * Math.cos(t), r * Math.sin(t)];
});
const g4 = gauss(44);
export const NOISE = SPIRAL.map(() => [g4(), g4()]);
export const SHOW_T = [0, 20, 100, 300, 999];
export const forward = (t: number) => {
  const a = Math.sqrt(ALPHA_BAR[t]);
  const b = Math.sqrt(1 - ALPHA_BAR[t]);
  return SPIRAL.map((p, i) => [a * p[0] + b * NOISE[i][0], a * p[1] + b * NOISE[i][1]]);
};
/** DDPM reverse step on one point with a perfect noise prediction (worked example at t = 500) */
export const STEP_T = 500;
export const STEP_X0 = SPIRAL[100];
export const STEP_EPS = NOISE[100];
export const STEP_XT = [0, 1].map((i) => Math.sqrt(ALPHA_BAR[STEP_T]) * STEP_X0[i] + Math.sqrt(1 - ALPHA_BAR[STEP_T]) * STEP_EPS[i]);
export const STEP_MEAN = [0, 1].map(
  (i) => (1 / Math.sqrt(1 - BETAS[STEP_T])) * (STEP_XT[i] - (BETAS[STEP_T] / Math.sqrt(1 - ALPHA_BAR[STEP_T])) * STEP_EPS[i]),
);
export const STEP_SIGMA = Math.sqrt(BETAS[STEP_T]);

// --- Chapter 5: classifier-free guidance and flow matching -----------------
/** two 2-D noise predictions at one pixel pair */
const g5e = gauss(57);
export const EPS_U = [g5e() * 0.5, g5e() * 0.5];
export const EPS_C = [EPS_U[0] + 0.3 + 0.1 * g5e(), EPS_U[1] + 0.2 + 0.1 * g5e()];
export const W_SHOW = [0, 1, 3, 7.5];
export const guided = (w: number) => EPS_U.map((u, i) => u + w * (EPS_C[i] - u));
// flow matching: 24 noise/data pairs, straight paths
const r5 = rng(8);
const g5 = gauss(81);
export const FM_PAIRS = Array.from({ length: 24 }, () => {
  const d = SPIRAL[Math.floor(r5() * SPIRAL.length)];
  const x0 = [g5() * 0.8, g5() * 0.8];
  return { x0, x1: d, v: [d[0] - x0[0], d[1] - x0[1]] };
});
/** one Euler step with the exact straight-line velocity lands on the data */
export const EULER_ERR = Math.max(...FM_PAIRS.map((p) => Math.hypot(p.x0[0] + p.v[0] - p.x1[0], p.x0[1] + p.v[1] - p.x1[1])));
