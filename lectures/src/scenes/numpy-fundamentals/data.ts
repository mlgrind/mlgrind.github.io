// Every number on screen in the NumPy Fundamentals lecture comes from here.
import { mean, rng, type Mat } from '../../lib/math';

const randint = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

// --- Chapter 1: loop vs whole-array --------------------------------------------
const r1 = rng(11);
export const X1 = Array.from({ length: 10 }, () => randint(r1, 0, 9));
export const Y1 = X1.map((v) => 2 * v + 1);

// --- Chapter 2: creation ---------------------------------------------------------
const full = (rows: number, cols: number, v: number): Mat => Array.from({ length: rows }, () => new Array(cols).fill(v));
export const ZEROS = full(3, 4, 0);
export const ONES = full(2, 3, 1);
export const ARANGE = Array.from({ length: 10 }, (_, i) => i);
export const LINSPACE = Array.from({ length: 5 }, (_, i) => i / 4); // np.linspace(0, 1, 5)
export const EYE: Mat = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => (i === j ? 1 : 0)));

// --- Chapter 3: indexing on np.arange(20).reshape(4, 5) ------------------------------
export const ARR20: Mat = Array.from({ length: 4 }, (_, i) => Array.from({ length: 5 }, (_, j) => i * 5 + j));
export type Sel = { code: string; pick: (i: number, j: number) => boolean; result: Mat; shape: number[] };
export const SELECTIONS: Sel[] = [
  { code: 'arr[1]', pick: (i) => i === 1, result: [ARR20[1]], shape: [5] },
  { code: 'arr[:, 2]', pick: (_, j) => j === 2, result: [ARR20.map((r) => r[2])], shape: [4] },
  {
    code: 'arr[1:3, 2:5]',
    pick: (i, j) => i >= 1 && i < 3 && j >= 2 && j < 5,
    result: ARR20.slice(1, 3).map((r) => r.slice(2, 5)),
    shape: [2, 3],
  },
  {
    code: 'arr[[0,1,2,3], [0,1,2,3]]',
    pick: (i, j) => i === j,
    result: [[0, 1, 2, 3].map((k) => ARR20[k][k])],
    shape: [4],
  },
];
export const REVERSED: Mat = [...ARR20].reverse();

// --- Chapter 4: broadcasting ------------------------------------------------------
const r4 = rng(42);
export const B_ARR: Mat = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => randint(r4, 1, 9)));
export const BIAS = Array.from({ length: 4 }, () => randint(r4, -5, 5) * 10);
export const BIASED: Mat = B_ARR.map((row) => row.map((v, j) => v + BIAS[j]));
export const ROW_MEANS = B_ARR.map((row) => mean(row));
export const ROW_CENTERED: Mat = B_ARR.map((row, i) => row.map((v) => v - ROW_MEANS[i]));

// --- Chapter 5: aggregations and reshape -----------------------------------------------
const r5 = rng(5);
export const AG: Mat = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => randint(r5, 0, 9)));
export const COL_SUM = AG[0].map((_, j) => AG.reduce((s, r) => s + r[j], 0));
export const ROW_SUM = AG.map((r) => r.reduce((a, b) => a + b, 0));
const flat = AG.flat();
export const AG_SUM = flat.reduce((a, b) => a + b, 0);
export const AG_MEAN = AG_SUM / flat.length;
export const AG_STD = Math.sqrt(flat.reduce((s, v) => s + (v - AG_MEAN) ** 2, 0) / flat.length); // np.std (population)
export const ARGMAX = flat.indexOf(Math.max(...flat)); // first occurrence, like np.argmax
export const ARGMAX_RC = [Math.floor(ARGMAX / 4), ARGMAX % 4];
export const R12 = Array.from({ length: 12 }, (_, i) => i);
