// Every number on screen in the Supervised Learning lecture comes from here.
import { gauss, rng, type Mat } from '../../lib/math';

const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

/** Solve A x = b (small dense systems) by Gaussian elimination with partial pivoting. */
function solve(A: Mat, b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

// --- Chapter 1: linear regression by gradient descent ------------------------
const g1 = gauss(3);
const r1 = rng(3);
export const LR_N = 20;
export const LR_X = Array.from({ length: LR_N }, () => 0.2 + 4.6 * r1());
export const LR_Y = LR_X.map((x) => 1.5 + 0.8 * x + 0.45 * g1());
export const LR_LR = 0.05;
export const LR_ITERS = 200;
export const mse = (w: number, b: number) => mean(LR_X.map((x, i) => (w * x + b - LR_Y[i]) ** 2));
/** (w, b, loss) after each step, starting at w = b = 0 */
export const LR_PATH = (() => {
  let w = 0;
  let b = 0;
  const out = [{ w, b, loss: mse(w, b) }];
  for (let t = 0; t < LR_ITERS; t++) {
    const err = LR_X.map((x, i) => w * x + b - LR_Y[i]);
    const dw = (2 / LR_N) * err.reduce((s, e, i) => s + e * LR_X[i], 0);
    const db = (2 / LR_N) * err.reduce((s, e) => s + e, 0);
    w -= LR_LR * dw;
    b -= LR_LR * db;
    out.push({ w, b, loss: mse(w, b) });
  }
  return out;
})();
// exact least-squares optimum, and the quadratic form of the MSE around it
const Ex = mean(LR_X);
const Exx = mean(LR_X.map((x) => x * x));
const Exy = mean(LR_X.map((x, i) => x * LR_Y[i]));
const Ey = mean(LR_Y);
export const LR_OPT = (() => {
  const [w, b] = solve(
    [
      [Exx, Ex],
      [Ex, 1],
    ],
    [Exy, Ey],
  );
  return { w, b, loss: mse(w, b) };
})();
/** points on the MSE level set `level`, as an ellipse in (w, b) */
export function mseContour(level: number, n = 720): [number, number][] {
  const out: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const th = (2 * Math.PI * k) / n;
    const u = [Math.cos(th), Math.sin(th)];
    const q = Exx * u[0] * u[0] + 2 * Ex * u[0] * u[1] + u[1] * u[1];
    const r = Math.sqrt(Math.max(0, level - LR_OPT.loss) / q);
    out.push([LR_OPT.w + r * u[0], LR_OPT.b + r * u[1]]);
  }
  return out;
}
export const LR_LEVELS = [0.35, 0.8, 1.8, 3.5, 6, 9.5];

// Ridge and lasso on 5 standardized features (true weights include zeros)
const g1b = gauss(41);
export const RL_N = 60;
export const RL_TRUE = [2.5, 0, -1.6, 0, 0.6];
const RL_X: Mat = Array.from({ length: RL_N }, () => RL_TRUE.map(() => g1b()));
const RL_Y = RL_X.map((r) => r.reduce((s, v, j) => s + v * RL_TRUE[j], 0) + 4 + 1.0 * g1b());
const d = RL_TRUE.length;
const xm = RL_TRUE.map((_, j) => mean(RL_X.map((r) => r[j])));
const ym = mean(RL_Y);
const Xc = RL_X.map((r) => r.map((v, j) => v - xm[j]));
const yc = RL_Y.map((v) => v - ym);
const XtX = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Xc.reduce((s, r) => s + r[i] * r[j], 0)));
const Xty = Array.from({ length: d }, (_, j) => Xc.reduce((s, r, k) => s + r[j] * yc[k], 0));
export const RL_LAM_RIDGE = 60;
export const RL_LAM_LASSO = 0.5;
export const RL_OLS = solve(XtX, Xty);
export const RL_RIDGE = solve(
  XtX.map((r, i) => r.map((v, j) => v + (i === j ? RL_LAM_RIDGE : 0))),
  Xty,
);
export const RL_LASSO = (() => {
  const w = new Array(d).fill(0);
  const soft = (a: number, l: number) => Math.sign(a) * Math.max(Math.abs(a) - l, 0);
  for (let sweep = 0; sweep < 100; sweep++) {
    for (let j = 0; j < d; j++) {
      const r = yc.map((v, k) => v - Xc[k].reduce((s, x, jj) => s + x * w[jj], 0));
      const rho = Xc.reduce((s, row, k) => s + row[j] * (r[k] + row[j] * w[j]), 0) / RL_N;
      const z = Xc.reduce((s, row) => s + row[j] * row[j], 0) / RL_N;
      w[j] = z === 0 ? 0 : soft(rho, RL_LAM_LASSO) / z;
    }
  }
  return w;
})();

// --- Chapter 2: logistic regression ----------------------------------------
export { sigmoid };
const g2 = gauss(17);
export const LOG_N = 30;
export const LOG_Y = Array.from({ length: LOG_N }, (_, i) => (i < LOG_N / 2 ? 0 : 1));
export const LOG_X: Mat = LOG_Y.map((y) => (y ? [0.9 + 0.95 * g2(), 0.7 + 0.95 * g2()] : [-0.9 + 0.95 * g2(), -0.6 + 0.95 * g2()]));
export const LOG_LR = 0.5;
export const LOG_ITERS = 300;
export const bce = (w: number[], b: number) =>
  -mean(
    LOG_X.map((x, i) => {
      const p = Math.min(1 - 1e-15, Math.max(1e-15, sigmoid(w[0] * x[0] + w[1] * x[1] + b)));
      return LOG_Y[i] * Math.log(p) + (1 - LOG_Y[i]) * Math.log(1 - p);
    }),
  );
export const LOG_PATH = (() => {
  let w = [0, 0];
  let b = 0;
  // start from a deliberately poor boundary so the fit is visible
  w = [-0.6, 0.9];
  b = 0.4;
  const out = [{ w: [...w], b, loss: bce(w, b) }];
  for (let t = 0; t < LOG_ITERS; t++) {
    const err = LOG_X.map((x, i) => sigmoid(w[0] * x[0] + w[1] * x[1] + b) - LOG_Y[i]);
    const dw = [0, 1].map((j) => mean(err.map((e, i) => e * LOG_X[i][j])));
    const db = mean(err);
    w = [w[0] - LOG_LR * dw[0], w[1] - LOG_LR * dw[1]];
    b -= LOG_LR * db;
    out.push({ w: [...w], b, loss: bce(w, b) });
  }
  return out;
})();
export const LOG_ACC = (() => {
  const f = LOG_PATH[LOG_PATH.length - 1];
  return mean(LOG_X.map((x, i) => ((sigmoid(f.w[0] * x[0] + f.w[1] * x[1] + f.b) >= 0.5 ? 1 : 0) === LOG_Y[i] ? 1 : 0)));
})();

// --- Chapter 3: linear SVM ---------------------------------------------------
const g3 = gauss(29);
export const SVM_N = 28;
export const SVM_Y = Array.from({ length: SVM_N }, (_, i) => (i % 2 ? 1 : -1));
export const SVM_X: Mat = SVM_Y.map((y) => [y * 1.1 + 0.8 * g3(), y * 0.9 + 0.8 * g3()]);
export const SVM_LAM = 0.01;
export const SVM_LR = 0.05;
export const SVM_ITERS = 2000;
export const SVM = (() => {
  let w = [0, 0];
  let b = 0;
  for (let t = 0; t < SVM_ITERS; t++) {
    const dw = [SVM_LAM * w[0], SVM_LAM * w[1]];
    let db = 0;
    SVM_X.forEach((x, i) => {
      if (SVM_Y[i] * (w[0] * x[0] + w[1] * x[1] + b) < 1) {
        dw[0] -= (SVM_Y[i] * x[0]) / SVM_N;
        dw[1] -= (SVM_Y[i] * x[1]) / SVM_N;
        db -= SVM_Y[i] / SVM_N;
      }
    });
    w = [w[0] - SVM_LR * dw[0], w[1] - SVM_LR * dw[1]];
    b -= SVM_LR * db;
  }
  const margins = SVM_X.map((x, i) => SVM_Y[i] * (w[0] * x[0] + w[1] * x[1] + b));
  const hinge = margins.map((m) => Math.max(0, 1 - m));
  return { w, b, margins, hinge, loss: mean(hinge), width: 2 / Math.hypot(w[0], w[1]) };
})();
export const SVM_SUPPORT = SVM.margins.map((m) => m < 1.01);

// --- Chapter 4: Gini, splits, boosting, bagging ------------------------------
export const gini = (labels: number[]) => {
  if (!labels.length) return 0;
  const p1 = labels.filter((l) => l === 1).length / labels.length;
  return 1 - p1 * p1 - (1 - p1) * (1 - p1);
};
const r4 = rng(77);
export const TREE_N = 26;
export const TREE_X: Mat = Array.from({ length: TREE_N }, () => [r4(), r4()]);
export const TREE_Y = TREE_X.map(([a, b]) => (a > 0.45 && b > 0.35 ? 1 : 0) ^ (r4() < 0.06 ? 1 : 0));

type Split = { feature: number; t: number; imp: number };
/** every candidate midpoint threshold on `feature` with its weighted Gini */
export function scan(idx: number[], feature: number) {
  const vals = [...new Set(idx.map((i) => TREE_X[i][feature]))].sort((a, b) => a - b);
  return vals.slice(0, -1).map((v, k) => {
    const t = (v + vals[k + 1]) / 2;
    const L = idx.filter((i) => TREE_X[i][feature] <= t).map((i) => TREE_Y[i]);
    const R = idx.filter((i) => TREE_X[i][feature] > t).map((i) => TREE_Y[i]);
    return { t, imp: (L.length * gini(L) + R.length * gini(R)) / idx.length };
  });
}
function bestSplit(idx: number[], X: Mat = TREE_X, Y: number[] = TREE_Y): Split | null {
  let best: Split | null = null;
  for (let f = 0; f < 2; f++) {
    const vals = [...new Set(idx.map((i) => X[i][f]))].sort((a, b) => a - b);
    for (let k = 0; k + 1 < vals.length; k++) {
      const t = (vals[k] + vals[k + 1]) / 2;
      const L = idx.filter((i) => X[i][f] <= t).map((i) => Y[i]);
      const R = idx.filter((i) => X[i][f] > t).map((i) => Y[i]);
      const imp = (L.length * gini(L) + R.length * gini(R)) / idx.length;
      if (!best || imp < best.imp - 1e-12) best = { feature: f, t, imp };
    }
  }
  return best;
}
export const ALL = TREE_X.map((_, i) => i);
export const ROOT_GINI = gini(TREE_Y);
export const SCAN0 = scan(ALL, 0);
export const SPLIT1 = bestSplit(ALL)!;
const right1 = ALL.filter((i) => TREE_X[i][SPLIT1.feature] > SPLIT1.t);
const left1 = ALL.filter((i) => TREE_X[i][SPLIT1.feature] <= SPLIT1.t);
export const SPLIT2 = bestSplit(right1)!;
export const NODES = (() => {
  const rl = right1.filter((i) => TREE_X[i][SPLIT2.feature] <= SPLIT2.t);
  const rr = right1.filter((i) => TREE_X[i][SPLIT2.feature] > SPLIT2.t);
  const counts = (idx: number[]) => [idx.filter((i) => TREE_Y[i] === 0).length, idx.filter((i) => TREE_Y[i] === 1).length];
  return {
    root: counts(ALL),
    left: { c: counts(left1), g: gini(left1.map((i) => TREE_Y[i])) },
    right: { c: counts(right1), g: gini(right1.map((i) => TREE_Y[i])) },
    rl: { c: counts(rl), g: gini(rl.map((i) => TREE_Y[i])) },
    rr: { c: counts(rr), g: gini(rr.map((i) => TREE_Y[i])) },
  };
})();

// Bagging: depth-2 trees on bootstrap samples, voting on one query point
type Node = { leaf: true; value: number } | { leaf: false; f: number; t: number; l: Node; r: Node };
function build(idx: number[], X: Mat, Y: number[], depth: number, maxDepth: number): Node {
  const ys = idx.map((i) => Y[i]);
  const ones = ys.filter((y) => y === 1).length;
  const major = ones > ys.length - ones ? 1 : 0;
  if (depth >= maxDepth || idx.length < 2 || ones === 0 || ones === ys.length) return { leaf: true, value: major };
  const s = bestSplit(idx, X, Y);
  if (!s) return { leaf: true, value: major };
  return {
    leaf: false,
    f: s.feature,
    t: s.t,
    l: build(idx.filter((i) => X[i][s.feature] <= s.t), X, Y, depth + 1, maxDepth),
    r: build(idx.filter((i) => X[i][s.feature] > s.t), X, Y, depth + 1, maxDepth),
  };
}
const predict = (n: Node, x: number[]): number => (n.leaf ? n.value : predict(x[n.f] <= n.t ? n.l : n.r, x));
function bagVotes(q: number[]) {
  const rb = rng(5);
  return Array.from({ length: 7 }, () => {
    const boot = Array.from({ length: TREE_N }, () => Math.floor(rb() * TREE_N));
    const X = boot.map((i) => TREE_X[i]);
    const Y = boot.map((i) => TREE_Y[i]);
    return predict(
      build(
        X.map((_, i) => i),
        X,
        Y,
        0,
        2,
      ),
      q,
    );
  });
}
// A query near the boundary, picked (first on a coarse grid) so the trees disagree.
export const BAG_QUERY = (() => {
  for (let a = 0.3; a <= 0.7; a += 0.02)
    for (let b = 0.2; b <= 0.6; b += 0.02) {
      const v = bagVotes([a, b]);
      const ones = v.filter((x) => x === 1).length;
      if (ones >= 2 && ones <= 5) return [a, b];
    }
  throw new Error('no split vote');
})();
export const BAG_VOTES = bagVotes(BAG_QUERY);

// Gradient boosting with stumps on a 1-D regression problem
const g4 = gauss(88);
export const GB_N = 40;
export const GB_X = Array.from({ length: GB_N }, (_, i) => (6 * (i + 0.5)) / GB_N);
export const GB_Y = GB_X.map((x) => Math.sin(x) + 0.5 * x * 0.3 + 0.25 * g4());
export const GB_LR = 0.5;
export const GB_ROUNDS = 30;
export const GB = (() => {
  const f0 = mean(GB_Y);
  let F = GB_Y.map(() => f0);
  const snaps: { round: number; F: number[]; loss: number }[] = [{ round: 0, F: [...F], loss: mean(GB_Y.map((y, i) => (y - F[i]) ** 2)) }];
  for (let m = 1; m <= GB_ROUNDS; m++) {
    const r = GB_Y.map((y, i) => y - F[i]);
    let best = { t: 0, lv: 0, rv: 0, sse: Infinity };
    for (let k = 0; k + 1 < GB_N; k++) {
      const t = (GB_X[k] + GB_X[k + 1]) / 2;
      const L = r.filter((_, i) => GB_X[i] <= t);
      const R = r.filter((_, i) => GB_X[i] > t);
      const lv = mean(L);
      const rv = mean(R);
      const sse = L.reduce((s, v) => s + (v - lv) ** 2, 0) + R.reduce((s, v) => s + (v - rv) ** 2, 0);
      if (sse < best.sse) best = { t, lv, rv, sse };
    }
    F = F.map((f, i) => f + GB_LR * (GB_X[i] <= best.t ? best.lv : best.rv));
    snaps.push({ round: m, F: [...F], loss: mean(GB_Y.map((y, i) => (y - F[i]) ** 2)) });
  }
  return { f0, snaps };
})();

// --- Chapter 5: k-NN and Gaussian Naive Bayes --------------------------------
const g5 = gauss(61);
const CENTERS = [
  [-1.2, -0.6],
  [1.1, -0.8],
  [0, 1.2],
];
export const KNN_X: Mat = [];
export const KNN_Y: number[] = [];
CENTERS.forEach((c, k) => {
  for (let i = 0; i < 12; i++) {
    KNN_X.push([c[0] + 0.75 * g5(), c[1] + 0.75 * g5()]);
    KNN_Y.push(k);
  }
});
export const KNN_K = 5;
export const KNN_QUERY = [0.2, 0.2]; // a mixed neighbourhood with a clear winner
export const KNN_DIST = KNN_X.map((x) => Math.hypot(x[0] - KNN_QUERY[0], x[1] - KNN_QUERY[1]));
export const KNN_NEAR = KNN_DIST.map((dd, i) => ({ dd, i }))
  .sort((a, b) => a.dd - b.dd || a.i - b.i)
  .slice(0, KNN_K)
  .map((o) => o.i);
export const KNN_VOTES = [0, 1, 2].map((c) => KNN_NEAR.filter((i) => KNN_Y[i] === c).length);
export const KNN_PRED = KNN_VOTES.indexOf(Math.max(...KNN_VOTES));

// Gaussian NB on one feature, two classes
export const NB_X = Array.from({ length: 20 }, (_, i) => (i < 12 ? 1.0 + 0.8 * g5() : 3.4 + 0.6 * g5()));
export const NB_Y = NB_X.map((_, i) => (i < 12 ? 0 : 1));
export const NB = (() => {
  const varAll = (() => {
    const m = mean(NB_X);
    return mean(NB_X.map((x) => (x - m) ** 2));
  })();
  const eps = 1e-9 * varAll;
  return [0, 1].map((c) => {
    const xs = NB_X.filter((_, i) => NB_Y[i] === c);
    const mu = mean(xs);
    const v = mean(xs.map((x) => (x - mu) ** 2)) + eps;
    return { prior: xs.length / NB_X.length, mu, v };
  });
})();
export const nbJll = (x: number) => NB.map((c) => Math.log(c.prior) - 0.5 * Math.log(2 * Math.PI * c.v) - (0.5 * (x - c.mu) ** 2) / c.v);
export const logsumexp = (a: number[]) => {
  const m = Math.max(...a);
  return m + Math.log(a.reduce((s, v) => s + Math.exp(v - m), 0));
};
export const nbPosterior1 = (x: number) => {
  const j = nbJll(x);
  return Math.exp(j[1] - logsumexp(j));
};
/** why log space: the product of 600 per-feature densities underflows */
export const UNDERFLOW = (() => {
  const g = gauss(99);
  const dens = Array.from({ length: 600 }, () => {
    const x = g();
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  });
  return { n: dens.length, product: dens.reduce((a, b) => a * b, 1), logSum: dens.reduce((a, b) => a + Math.log(b), 0) };
})();
