// Every number on screen in the Unsupervised Learning lecture comes from here.
import { gauss, rng, type Mat } from '../../lib/math';

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

// --- Chapters 1-2: k-means on three blobs -----------------------------------
const g1 = gauss(8);
const BLOBS = [
  [-2.0, 1.2],
  [2.1, 1.6],
  [0.4, -1.9],
];
export const KM_X: Mat = [];
export const KM_TRUE: number[] = [];
BLOBS.forEach((c, k) => {
  for (let i = 0; i < 16; i++) {
    KM_X.push([c[0] + 0.62 * g1(), c[1] + 0.62 * g1()]);
    KM_TRUE.push(k);
  }
});
// shuffle so index order carries no hint of the blobs
{
  const r = rng(12);
  for (let i = KM_X.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [KM_X[i], KM_X[j]] = [KM_X[j], KM_X[i]];
    [KM_TRUE[i], KM_TRUE[j]] = [KM_TRUE[j], KM_TRUE[i]];
  }
}
export const assign = (X: Mat, C: Mat) =>
  X.map((x) => {
    let best = 0;
    for (let j = 1; j < C.length; j++) if (d2(x, C[j]) < d2(x, C[best])) best = j;
    return best;
  });
export const inertia = (X: Mat, C: Mat, labels: number[]) => X.reduce((s, x, i) => s + d2(x, C[labels[i]]), 0);

export type KMStep = { C: Mat; labels: number[]; inertia: number };
/** Lloyd's algorithm: one entry per assignment, with the centroids it was made against */
export function lloyd(X: Mat, C0: Mat, maxIter = 20): { steps: KMStep[]; final: Mat; nIter: number } {
  let C = C0.map((c) => [...c]);
  const steps: KMStep[] = [];
  let prev: number[] | null = null;
  let nIter = 0;
  for (let it = 1; it <= maxIter; it++) {
    nIter = it;
    const labels = assign(X, C);
    steps.push({ C: C.map((c) => [...c]), labels, inertia: inertia(X, C, labels) });
    const Cn = C.map((c, j) => {
      const pts = X.filter((_, i) => labels[i] === j);
      return pts.length ? [mean(pts.map((p) => p[0])), mean(pts.map((p) => p[1]))] : c;
    });
    const shift = Math.max(...Cn.map((c, j) => Math.sqrt(d2(c, C[j]))));
    const same = prev !== null && labels.every((l, i) => l === prev![i]);
    C = Cn;
    prev = labels;
    if (same || shift < 1e-4) break;
  }
  const labels = assign(X, C);
  steps.push({ C: C.map((c) => [...c]), labels, inertia: inertia(X, C, labels) });
  return { steps, final: C, nIter };
}
/** chapter 1: start from three data points picked by a seeded draw */
const r1 = rng(21);
export const KM_INIT: Mat = [0, 1, 2].map(() => [...KM_X[Math.floor(r1() * KM_X.length)]]);
export const KM_RUN = lloyd(KM_X, KM_INIT);

/** chapter 2: a bad start (two centroids in one blob) vs k-means++ */
const blobPts = (k: number) => KM_X.filter((_, i) => KM_TRUE[i] === k);
export const BAD_INIT: Mat = [blobPts(0)[0], blobPts(0)[1], [(BLOBS[1][0] + BLOBS[2][0]) / 2, (BLOBS[1][1] + BLOBS[2][1]) / 2]].map((c) => [...c]);
export const BAD_RUN = lloyd(KM_X, BAD_INIT);
export const PP = (() => {
  const r = rng(3);
  const n = KM_X.length;
  const C: Mat = [[...KM_X[Math.floor(r() * n)]]];
  const picks = [KM_X.indexOf(KM_X.find((x) => x[0] === C[0][0] && x[1] === C[0][1])!)];
  const d2s: number[][] = [];
  while (C.length < 3) {
    const D2 = KM_X.map((x) => Math.min(...C.map((c) => d2(x, c))));
    d2s.push(D2);
    const cdf: number[] = [];
    D2.reduce((s, v, i) => ((cdf[i] = s + v), s + v), 0);
    const u = r() * cdf[n - 1];
    const i = cdf.findIndex((v) => v > u);
    C.push([...KM_X[i]]);
    picks.push(i);
  }
  return { C, picks, d2s };
})();
export const PP_RUN = lloyd(KM_X, PP.C);

// --- Chapter 3: PCA on a correlated 2-D cloud --------------------------------
const g3 = gauss(19);
export const PCA_X: Mat = Array.from({ length: 50 }, () => {
  const a = g3() * 1.5;
  const b = g3() * 0.45;
  const th = 0.55;
  return [3 + a * Math.cos(th) - b * Math.sin(th), 2 + a * Math.sin(th) + b * Math.cos(th)];
});
export const PCA_MEAN = [mean(PCA_X.map((x) => x[0])), mean(PCA_X.map((x) => x[1]))];
export const PCA_C: Mat = PCA_X.map((x) => [x[0] - PCA_MEAN[0], x[1] - PCA_MEAN[1]]);
const n3 = PCA_X.length;
const sxx = PCA_C.reduce((s, x) => s + x[0] * x[0], 0) / (n3 - 1);
const syy = PCA_C.reduce((s, x) => s + x[1] * x[1], 0) / (n3 - 1);
const sxy = PCA_C.reduce((s, x) => s + x[0] * x[1], 0) / (n3 - 1);
/** sample covariance (ddof = 1, as np.cov) */
export const PCA_COV: Mat = [
  [sxx, sxy],
  [sxy, syy],
];
export const PCA_EIG = (() => {
  const tr = sxx + syy;
  const det = sxx * syy - sxy * sxy;
  const disc = Math.sqrt((tr * tr) / 4 - det);
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  const v = (l: number) => {
    const x = sxy;
    const y = l - sxx;
    const nn = Math.hypot(x, y);
    return [x / nn, y / nn];
  };
  return { l: [l1, l2], v: [v(l1), v(l2)], explained: [l1 / tr, l2 / tr] };
})();
export const PCA_PROJ = PCA_C.map((x) => x[0] * PCA_EIG.v[0][0] + x[1] * PCA_EIG.v[0][1]);

// --- Chapter 4: 1-D Gaussian mixture fitted by EM ----------------------------
const g4 = gauss(44);
export const GMM_X = [
  ...Array.from({ length: 36 }, () => -1.4 + 0.7 * g4()),
  ...Array.from({ length: 24 }, () => 1.9 + 0.9 * g4()),
];
const logN = (x: number, mu: number, v: number) => -0.5 * Math.log(2 * Math.PI * v) - ((x - mu) ** 2) / (2 * v);
const lse = (a: number[]) => {
  const m = Math.max(...a);
  return m + Math.log(a.reduce((s, v) => s + Math.exp(v - m), 0));
};
export type GMMParams = { means: number[]; vars: number[]; weights: number[] };
export function eStep(p: GMMParams) {
  let ll = 0;
  const resp = GMM_X.map((x) => {
    const lj = p.means.map((mu, k) => Math.log(p.weights[k]) + logN(x, mu, p.vars[k]));
    const lpx = lse(lj);
    ll += lpx;
    return lj.map((v) => Math.exp(v - lpx));
  });
  return { resp, ll };
}
export const GMM_INIT: GMMParams = { means: [-0.3, 0.6], vars: [2.5, 2.5], weights: [0.5, 0.5] };
export const GMM_ITERS = 15;
export const GMM_HIST = (() => {
  const out: { p: GMMParams; resp: number[][]; ll: number }[] = [];
  let p = GMM_INIT;
  for (let t = 0; t < GMM_ITERS; t++) {
    const { resp, ll } = eStep(p);
    out.push({ p, resp, ll });
    const Nk = [0, 1].map((k) => resp.reduce((s, r) => s + r[k], 0));
    const means = [0, 1].map((k) => resp.reduce((s, r, i) => s + r[k] * GMM_X[i], 0) / Nk[k]);
    const vars = [0, 1].map((k) => resp.reduce((s, r, i) => s + r[k] * (GMM_X[i] - means[k]) ** 2, 0) / Nk[k] + 1e-6);
    p = { means, vars, weights: Nk.map((v) => v / GMM_X.length) };
  }
  const { resp, ll } = eStep(p);
  out.push({ p, resp, ll });
  return out;
})();
/** the point shown with its responsibilities: the one closest to the overlap */
export const GMM_PROBE = (() => {
  const last = GMM_HIST[GMM_HIST.length - 1].resp;
  let best = 0;
  last.forEach((r, i) => {
    if (Math.min(...r) > Math.min(...last[best])) best = i;
  });
  return best;
})();

// --- Chapter 5: DBSCAN on two crescents --------------------------------------
const g5 = gauss(66);
const r5 = rng(66);
const NM = 34;
export const DB_X: Mat = [];
for (let i = 0; i < NM; i++) {
  const t = (Math.PI * (i + 0.2 + 0.6 * r5())) / NM;
  DB_X.push([Math.cos(t) + 0.06 * g5(), Math.sin(t) + 0.06 * g5()]);
}
for (let i = 0; i < NM; i++) {
  const t = (Math.PI * (i + 0.2 + 0.6 * r5())) / NM;
  DB_X.push([1 - Math.cos(t) + 0.06 * g5(), 0.45 - Math.sin(t) + 0.06 * g5()]);
}
// outliers: uniform draws kept only if they sit away from both crescents
for (let tries = 0, added = 0; added < 6 && tries < 10000; tries++) {
  const p = [-1.3 + 3.6 * r5(), -0.9 + 2.2 * r5()];
  if (DB_X.every((q) => d2(p, q) > 0.45 ** 2)) {
    DB_X.push(p);
    added++;
  }
}
export const DB_EPS = 0.3;
export const DB_MIN = 4;
export const DB_NEIGH = DB_X.map((p) => DB_X.map((q, j) => (Math.sqrt(d2(p, q)) <= DB_EPS ? j : -1)).filter((j) => j >= 0));
export const DB_CORE = DB_NEIGH.map((nb) => nb.length >= DB_MIN);
export const DB = (() => {
  const n = DB_X.length;
  const labels = new Array(n).fill(-1);
  const order = new Array(n).fill(-1); // discovery order, for the animation
  let t = 0;
  let cluster = 0;
  for (let p = 0; p < n; p++) {
    if (labels[p] !== -1 || !DB_CORE[p]) continue;
    labels[p] = cluster;
    order[p] = t++;
    const queue = [p];
    while (queue.length) {
      const q = queue.shift()!;
      for (const r of DB_NEIGH[q]) {
        if (labels[r] === -1) {
          labels[r] = cluster;
          order[r] = t++;
          if (DB_CORE[r]) queue.push(r);
        }
      }
    }
    cluster++;
  }
  return { labels, order, nClusters: cluster, steps: t };
})();
/** the point used to illustrate eps and the core test: a core point with a modest count */
export const DB_PROBE = DB_CORE.findIndex((c, i) => c && DB_NEIGH[i].length >= DB_MIN + 1 && DB_X[i][1] > 0.6);
