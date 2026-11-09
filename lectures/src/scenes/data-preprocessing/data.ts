// Every number on screen in the Data Preprocessing lecture comes from here.
import { gauss, rng, type Mat } from '../../lib/math';

const nanmean = (v: number[]) => {
  const o = v.filter((x) => !Number.isNaN(x));
  return o.reduce((a, b) => a + b, 0) / o.length;
};
const median = (v: number[]) => {
  const o = v.filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
  const m = o.length >> 1;
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};
const popStd = (v: number[]) => {
  const m = nanmean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
};
const col = (m: Mat, j: number) => m.map((r) => r[j]);
export const minmax = (v: number[]) => {
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  return v.map((x) => (x - lo) / (hi - lo));
};

// --- Chapter 1: age and income for 8 people ---------------------------------
const g1 = gauss(11);
export const N_PEOPLE = 8;
export const AGE = Array.from({ length: N_PEOPLE }, () => Math.round(Math.min(64, Math.max(22, 41 + 11 * g1()))));
export const INCOME = AGE.map((a) => Math.round((22000 + 1100 * a + 14000 * g1()) / 100) * 100);
export const AGE_MM = minmax(AGE);
export const INCOME_MM = minmax(INCOME);
export const AGE_RANGE = [Math.min(...AGE), Math.max(...AGE)];
export const INCOME_RANGE = [Math.min(...INCOME), Math.max(...INCOME)];
const z = (v: number[]) => {
  const m = nanmean(v);
  const s = popStd(v);
  return { mean: m, std: s, z: v.map((x) => (x - m) / s) };
};
export const AGE_Z = z(AGE);
export const INCOME_Z = z(INCOME);
/** Distance between two people: share of the squared distance due to income. */
export const DIST_PAIR = [3, 5];
const [pa, pb] = DIST_PAIR;
const dAge = AGE[pa] - AGE[pb];
const dInc = INCOME[pa] - INCOME[pb];
export const INCOME_SHARE_RAW = dInc ** 2 / (dInc ** 2 + dAge ** 2);
const dAgeN = AGE_MM[pa] - AGE_MM[pb];
const dIncN = INCOME_MM[pa] - INCOME_MM[pb];
export const INCOME_SHARE_MM = dIncN ** 2 / (dIncN ** 2 + dAgeN ** 2);

// Opening: a messy table (first 5 people) -> a clean numeric matrix.
export const COLORS = ['red', 'green', 'blue'];
export const LABELS = [1, 0, 2, 1, 2]; // green, red, blue, green, blue
export const MESSY_N = 5;
export const MESSY_INCOME = INCOME.slice(0, MESSY_N).map((v, i) => (i === 2 ? NaN : v));
const incFilled = MESSY_INCOME.map((v) => (Number.isNaN(v) ? nanmean(MESSY_INCOME) : v));
const ageMM5 = minmax(AGE.slice(0, MESSY_N));
const incMM5 = minmax(incFilled);
export const CLEAN: Mat = Array.from({ length: MESSY_N }, (_, i) => [
  ageMM5[i],
  incMM5[i],
  ...COLORS.map((_, c) => (LABELS[i] === c ? 1 : 0)),
]);

// --- Chapter 2: sensor readings with gaps -----------------------------------
const g2 = gauss(23);
export const READINGS = Array.from({ length: 8 }, (_, i) => (i === 2 || i === 5 ? NaN : Math.round((20 + 3 * g2()) * 10) / 10));
export const READ_MASK = READINGS.map((v) => Number.isNaN(v));
export const READ_MEAN = nanmean(READINGS);
export const READ_FILLED = READINGS.map((v) => (Number.isNaN(v) ? READ_MEAN : v));
export const READ_OBSERVED = READINGS.filter((v) => !Number.isNaN(v));

// --- Chapter 3: one-hot -----------------------------------------------------
export const EYE: Mat = COLORS.map((_, i) => COLORS.map((__, j) => (i === j ? 1 : 0)));
export const ONE_HOT: Mat = LABELS.map((l) => EYE[l]);

// --- Chapter 4: stratified split, 40 samples, classes 24 / 10 / 6 -----------
export const CLASS_COUNTS = [24, 10, 6];
export const VAL_FRAC = 0.15;
export const TEST_FRAC = 0.15;
const permute = (idx: number[], r: () => number) => {
  const a = idx.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const yr = rng(4);
export const Y: number[] = permute(
  CLASS_COUNTS.flatMap((n, c) => new Array(n).fill(c)),
  yr,
);
export type Split = { train: number[]; val: number[]; test: number[] };
const roundHalfUp = (x: number) => Math.floor(x + 0.5);
export const STRAT_ROWS = CLASS_COUNTS.map((n, c) => {
  const nTest = Math.min(roundHalfUp(n * TEST_FRAC), n);
  const nVal = Math.min(roundHalfUp(n * VAL_FRAC), n - nTest);
  return { c, n, raw: n * TEST_FRAC, nTest, nVal, nTrain: n - nTest - nVal };
});
function stratified(seed: number): Split {
  const r = rng(seed);
  const out: Split = { train: [], val: [], test: [] };
  STRAT_ROWS.forEach(({ c, nTest, nVal }) => {
    const idx = Y.map((y, i) => (y === c ? i : -1)).filter((i) => i >= 0);
    const p = permute(idx, r);
    out.test.push(...p.slice(0, nTest));
    out.val.push(...p.slice(nTest, nTest + nVal));
    out.train.push(...p.slice(nTest + nVal));
  });
  return out;
}
export const STRAT = stratified(9);
const N_TEST = STRAT.test.length;
const N_VAL = STRAT.val.length;
function randomSplit(seed: number): Split {
  const p = permute(
    Y.map((_, i) => i),
    rng(seed),
  );
  return { test: p.slice(0, N_TEST), val: p.slice(N_TEST, N_TEST + N_VAL), train: p.slice(N_TEST + N_VAL) };
}
// The first seed whose plain random split leaves the rare class out of the
// test set: the "unlucky shuffle" the narration describes.
export const RANDOM_SEED = (() => {
  for (let s = 1; s < 1000; s++) if (randomSplit(s).test.every((i) => Y[i] !== 2)) return s;
  throw new Error('no unlucky seed');
})();
export const RANDOM = randomSplit(RANDOM_SEED);
export const classCounts = (idx: number[]) => CLASS_COUNTS.map((_, c) => idx.filter((i) => Y[i] === c).length);

// --- Chapter 5: leakage-safe imputation and scaling -------------------------
const g5 = gauss(57);
export const FEATURES = ['age', 'income (k$)'];
const person = (shift: number) => {
  const a = Math.round(38 + 9 * g5() + shift * 0.3);
  return [a, Math.round(30 + 0.9 * a + 8 * g5() + shift)];
};
// test rows come from a later, higher-earning cohort: the shift leakage hides
export const X_TRAIN: Mat = Array.from({ length: 6 }, () => person(0));
export const X_TEST: Mat = Array.from({ length: 3 }, () => person(28));
X_TRAIN[1][0] = NaN;
X_TRAIN[4][1] = NaN;
X_TEST[0][1] = NaN;

function fitStats(rows: Mat) {
  const fill = FEATURES.map((_, j) => median(col(rows, j)));
  const imputed = rows.map((r) => r.map((v, j) => (Number.isNaN(v) ? fill[j] : v)));
  const mean = FEATURES.map((_, j) => nanmean(col(imputed, j)));
  const std = FEATURES.map((_, j) => popStd(col(imputed, j)));
  return { fill, mean, std };
}
const transform = (rows: Mat, s: ReturnType<typeof fitStats>) =>
  rows.map((r) => r.map((v, j) => ((Number.isNaN(v) ? s.fill[j] : v) - s.mean[j]) / (s.std[j] > 0 ? s.std[j] : 1)));
export const SAFE = fitStats(X_TRAIN);
export const LEAKY = fitStats([...X_TRAIN, ...X_TEST]);
export const TRAIN_T = transform(X_TRAIN, SAFE);
export const TEST_T = transform(X_TEST, SAFE);
export const TEST_T_LEAKY = transform(X_TEST, LEAKY);
