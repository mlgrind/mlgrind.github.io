// Every number on screen in the Model Evaluation lecture comes from here.
import { gauss, rng, softmax } from '../../lib/math';

// --- Chapter 1: screening 100 people, 5 sick ----------------------------------
export const N_PEOPLE = 100;
const r1 = rng(11);
// 5 sick people at random positions in a 10x10 grid
const sickIdx = new Set<number>();
while (sickIdx.size < 5) sickIdx.add(Math.floor(r1() * N_PEOPLE));
export const SICK: boolean[] = Array.from({ length: N_PEOPLE }, (_, i) => sickIdx.has(i));
// a real (imperfect) screening model: a noisy score, flagged when score >= 0.5
const g1 = gauss(21);
export const SCREEN_SCORE = SICK.map((s) => 1 / (1 + Math.exp(-((s ? 1.2 : -2.2) + 1.1 * g1()))));
export const FLAGGED = SCREEN_SCORE.map((s) => s >= 0.5);

export function confusion(y: boolean[], pred: boolean[]) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  y.forEach((t, i) => {
    if (t && pred[i]) tp++;
    else if (!t && pred[i]) fp++;
    else if (t && !pred[i]) fn++;
    else tn++;
  });
  const n = y.length;
  return {
    tp, fp, fn, tn,
    accuracy: (tp + tn) / n,
    precision: tp + fp > 0 ? tp / (tp + fp) : 0,
    recall: tp + fn > 0 ? tp / (tp + fn) : 0,
  };
}
export const LAZY = confusion(SICK, SICK.map(() => false));
export const SCREEN = confusion(SICK, FLAGGED);

// --- Chapters 2-3: 20 scored samples (scores on a 0.05 grid, so some tie) -----
export const N = 20;
const r2 = rng(5);
const g2 = gauss(9);
export const Y: number[] = Array.from({ length: N }, () => (r2() < 0.4 ? 1 : 0));
export const SCORES: number[] = Y.map((y) => {
  const s = 1 / (1 + Math.exp(-((y ? 0.9 : -0.9) + 1.0 * g2())));
  return Math.min(0.95, Math.max(0.05, Math.round(s * 20) / 20));
});
export const P = Y.filter((y) => y === 1).length;
export const NEG = N - P;

/** distinct scores, descending; TP/FP counts at each `score >= t` (the pr-curve problem) */
export const THRESHOLDS = [...new Set(SCORES)].sort((a, b) => b - a);
export const PR = THRESHOLDS.map((t) => {
  let tp = 0, fp = 0;
  SCORES.forEach((s, i) => {
    if (s >= t) (Y[i] ? tp++ : fp++);
  });
  const fn = P - tp;
  return {
    t, tp, fp,
    precision: tp / (tp + fp),
    recall: tp / P,
    f1: (2 * tp) / (2 * tp + fp + fn),
    tpr: tp / P,
    fpr: fp / NEG,
  };
});
/** first maximum = highest threshold */
export const BEST = PR.reduce((b, r, i) => (r.f1 > PR[b].f1 ? i : b), 0);

/** ROC points: (0,0) at +inf, then one point per distinct score (ties = one diagonal step) */
export const ROC = [{ fpr: 0, tpr: 0 }, ...PR.map((r) => ({ fpr: r.fpr, tpr: r.tpr }))];
export const AUC_TRAPZ = ROC.slice(1).reduce((a, p, i) => a + (p.fpr - ROC[i].fpr) * (p.tpr + ROC[i].tpr) / 2, 0);
/** Mann-Whitney view: every positive vs every negative, ties count one half */
export const POS_SCORES = SCORES.filter((_, i) => Y[i] === 1).sort((a, b) => b - a);
export const NEG_SCORES = SCORES.filter((_, i) => Y[i] === 0).sort((a, b) => b - a);
export const PAIRS: number[][] = POS_SCORES.map((p) => NEG_SCORES.map((n) => (p > n ? 1 : p === n ? 0.5 : 0)));
export const AUC_PAIRS = PAIRS.flat().reduce((a, b) => a + b, 0) / (P * NEG);
export const N_TIED_PAIRS = PAIRS.flat().filter((v) => v === 0.5).length;
/** index of the first ROC step that moves diagonally (a tie between a positive and a negative) */
export const DIAG_STEP = ROC.findIndex((p, i) => i > 0 && p.fpr > ROC[i - 1].fpr && p.tpr > ROC[i - 1].tpr);

// --- Chapter 4: calibration -----------------------------------------------------
// True class probabilities p = softmax(z); an over-confident model reports softmax(2.2 z).
// Labels are sampled from p, so the honest model (softmax(z)) is calibrated by construction.
export const ECE_N = 2000;
export const BINS = 10;
const CLASSES = 4;
const g4 = gauss(42);
const r4 = rng(43);
const samples = Array.from({ length: ECE_N }, () => {
  const z = Array.from({ length: CLASSES }, () => 1.3 * g4());
  const p = softmax(z);
  const u = r4();
  let label = 0;
  for (let c = 0, acc = 0; c < CLASSES; c++) {
    acc += p[c];
    if (u < acc) { label = c; break; }
    label = c;
  }
  return { honest: p, over: softmax(z.map((v) => 2.2 * v)), label };
});

export function ece(probs: number[][], labels: number[], M = BINS) {
  const count = new Array(M).fill(0);
  const accSum = new Array(M).fill(0);
  const confSum = new Array(M).fill(0);
  probs.forEach((p, i) => {
    const conf = Math.max(...p);
    const pred = p.indexOf(conf);
    // (lo, hi] bins: number of interior edges strictly below conf
    let b = 0;
    for (let m = 1; m < M; m++) if (m / M < conf) b = m;
    count[b]++;
    accSum[b] += pred === labels[i] ? 1 : 0;
    confSum[b] += conf;
  });
  const acc = accSum.map((s, m) => (count[m] ? s / count[m] : 0));
  const conf = confSum.map((s, m) => (count[m] ? s / count[m] : 0));
  const n = labels.length;
  const value = count.reduce((a, c, m) => a + (c / n) * Math.abs(acc[m] - conf[m]), 0);
  return { ece: value, acc, conf, count };
}
const labels4 = samples.map((s) => s.label);
export const CAL_OVER = ece(samples.map((s) => s.over), labels4);
export const CAL_HONEST = ece(samples.map((s) => s.honest), labels4);

// --- Chapter 5: 3-fold cross-validation on the 20 scored samples -------------------
export const K = 3;
export function kfold(n: number, k: number) {
  const sizes = Array.from({ length: k }, (_, i) => Math.floor(n / k) + (i < n % k ? 1 : 0));
  let cur = 0;
  return sizes.map((sz) => {
    const val = Array.from({ length: sz }, (_, j) => cur + j);
    cur += sz;
    return { val, train: Array.from({ length: n }, (_, i) => i).filter((i) => !val.includes(i)) };
  });
}
/** "train" = pick the best-F1 threshold on the training folds; score = accuracy on the held-out fold */
export const FOLDS = kfold(N, K).map(({ val, train }) => {
  const ts = [...new Set(train.map((i) => SCORES[i]))].sort((a, b) => b - a);
  const pTrain = train.filter((i) => Y[i]).length;
  let best = ts[0];
  let bestF1 = -1;
  for (const t of ts) {
    const tp = train.filter((i) => SCORES[i] >= t && Y[i]).length;
    const fp = train.filter((i) => SCORES[i] >= t && !Y[i]).length;
    const f1 = (2 * tp) / (2 * tp + fp + (pTrain - tp));
    if (f1 > bestF1) { bestF1 = f1; best = t; }
  }
  const correct = val.filter((i) => (SCORES[i] >= best ? 1 : 0) === Y[i]).length;
  return { val, train, threshold: best, acc: correct / val.length };
});
export const CV_MEAN = FOLDS.reduce((a, f) => a + f.acc, 0) / K;
