// Every number on screen in the Einsum lecture comes from here, computed with a
// small generic einsum (below) so the "einsum vs classic" checks compare two
// independent code paths.
import { gauss, matmul, rng, softmax, transpose, type Mat } from '../../lib/math';

// --- a tiny dense tensor + einsum ------------------------------------------------
export interface T {
  shape: number[];
  data: number[];
}
export const tensor = (shape: number[], f: (idx: number[]) => number): T => {
  const n = shape.reduce((a, b) => a * b, 1);
  const data: number[] = [];
  for (let k = 0; k < n; k++) data.push(f(unflat(k, shape)));
  return { shape, data };
};
function unflat(k: number, shape: number[]): number[] {
  const idx = new Array(shape.length).fill(0);
  for (let d = shape.length - 1; d >= 0; d--) {
    idx[d] = k % shape[d];
    k = Math.floor(k / shape[d]);
  }
  return idx;
}
const flatOf = (idx: number[], shape: number[]) => idx.reduce((a, v, d) => a * shape[d] + v, 0);
export const at = (t: T, ...idx: number[]) => t.data[flatOf(idx, t.shape)];

/** einsum('ik,kj->ij', A, B): loops over every letter, multiplies, sums missing letters. */
export function einsum(spec: string, ...ops: T[]): T {
  const [lhs, out] = spec.split('->');
  const ins = lhs.split(',');
  const size: Record<string, number> = {};
  ins.forEach((s, o) => [...s].forEach((c, d) => (size[c] = ops[o].shape[d])));
  const letters = Object.keys(size);
  const outShape = [...out].map((c) => size[c]);
  const res = new Array(Math.max(1, outShape.reduce((a, b) => a * b, 1))).fill(0);
  const total = letters.reduce((a, c) => a * size[c], 1);
  for (let k = 0; k < total; k++) {
    const vals = unflat(k, letters.map((c) => size[c]));
    const v: Record<string, number> = {};
    letters.forEach((c, i) => (v[c] = vals[i]));
    // a repeated letter (ii) means only the cells where those indices agree
    let prod = 1;
    ins.forEach((s, o) => {
      prod *= at(ops[o], ...[...s].map((c) => v[c]));
    });
    res[outShape.length ? flatOf([...out].map((c) => v[c]), outShape) : 0] += prod;
  }
  return { shape: outShape, data: res };
}
export const fromMat = (m: Mat): T => ({ shape: [m.length, m[0].length], data: m.flat() });
export const fromVec = (v: number[]): T => ({ shape: [v.length], data: [...v] });
export const toMat = (t: T): Mat => Array.from({ length: t.shape[0] }, (_, i) => t.data.slice(i * t.shape[1], (i + 1) * t.shape[1]));
export const sliceB = (t: T, b: number): Mat => {
  const [, r, c] = t.shape;
  return Array.from({ length: r }, (_, i) => t.data.slice(b * r * c + i * c, b * r * c + (i + 1) * c));
};

const randint = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

// --- Chapter 1: one-input patterns -----------------------------------------------------
const r1 = rng(9);
export const A1: Mat = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => randint(r1, 0, 9)));
export const SQ: Mat = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => randint(r1, 0, 9)));
const tA1 = fromMat(A1);
export const ROWS = einsum('ij->i', tA1).data;
export const COLS = einsum('ij->j', tA1).data;
export const ALL = einsum('ij->', tA1).data[0];
export const A1T = toMat(einsum('ij->ji', tA1));
export const DIAG = einsum('ii->i', fromMat(SQ)).data;

// --- Chapter 2: two-input patterns -----------------------------------------------------
const r2 = rng(17);
export const U = Array.from({ length: 4 }, () => randint(r2, 1, 5));
export const Wv = Array.from({ length: 4 }, () => randint(r2, 1, 5));
export const UW = einsum('i,i->i', fromVec(U), fromVec(Wv)).data;
export const UdotW = einsum('i,i->', fromVec(U), fromVec(Wv)).data[0];
export const MA: Mat = Array.from({ length: 2 }, () => Array.from({ length: 3 }, () => randint(r2, 1, 5)));
export const MB: Mat = Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => randint(r2, 1, 5)));
export const MC = toMat(einsum('ik,kj->ij', fromMat(MA), fromMat(MB)));
export const H2: Mat = Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => randint(r2, 1, 5)));
export const HAD = toMat(einsum('ij,ij->ij', fromMat(H2), fromMat(H2)));
export const FROB = einsum('ij,ij->', fromMat(H2), fromMat(H2)).data[0];
const r2b = rng(3); // seed picked for three distinct entries
export const OV = Array.from({ length: 3 }, () => randint(r2b, 1, 4));
export const OUTER = toMat(einsum('i,j->ij', fromVec(OV), fromVec(OV)));

// --- Chapter 3: batched attention, b = 2, q = k = 3, d = 4, v = 2 --------------------------
const g3 = gauss(23);
const rnd = (shape: number[]) => tensor(shape, () => Math.round(g3() * 100) / 100);
export const BQ = rnd([2, 3, 4]);
export const BK = rnd([2, 3, 4]);
export const BV = rnd([2, 3, 2]);
export const BS = einsum('bqd,bkd->bqk', BQ, BK);
const scaled = { shape: BS.shape, data: BS.data.map((v) => v / Math.sqrt(4)) };
export const BW: T = (() => {
  const rows: number[] = [];
  for (let b = 0; b < 2; b++) for (let q = 0; q < 3; q++) rows.push(...softmax([0, 1, 2].map((k) => at(scaled, b, q, k))));
  return { shape: [2, 3, 3], data: rows };
})();
export const BO = einsum('bqk,bkv->bqv', BW, BV);

// --- Chapter 4: multi-head, b = 1, seq = 4, d_model = 8, h = 2, d_k = 4 -------------------------
export const SEQ = 4;
export const DM = 8;
export const NH = 2;
export const DKH = 4;
const g4 = gauss(4);
const rnd4 = () => tensor([1, SEQ, DM], () => g4());
const MQ = rnd4();
const MK = rnd4();
const MV = rnd4();
export const MQ_MAT = sliceB(MQ, 0);
const split = (t: T): T => ({ shape: [1, SEQ, NH, DKH], data: t.data }); // reshape (b, s, h, d)
const S4 = einsum('bqhd,bkhd->bhqk', split(MQ), split(MK));
const S4s = { shape: S4.shape, data: S4.data.map((v) => v / Math.sqrt(DKH)) };
export const HEAD_SCORES: Mat[] = [0, 1].map((h) => Array.from({ length: SEQ }, (_, q) => Array.from({ length: SEQ }, (_, k) => at(S4s, 0, h, q, k))));
const W4: T = { shape: S4s.shape, data: HEAD_SCORES.flatMap((m) => m.flatMap((row) => softmax(row))) };
export const HEAD_W: Mat[] = [0, 1].map((h) => Array.from({ length: SEQ }, (_, q) => Array.from({ length: SEQ }, (_, k) => at(W4, 0, h, q, k))));
const O4 = einsum('bhqk,bkhd->bqhd', W4, split(MV));
export const MH_OUT: Mat = sliceB({ shape: [1, SEQ, DM], data: O4.data }, 0); // reshape back to (b, s, d_model)

// --- Chapter 5: einsum vs the classics (the problem's own example) -------------------------
export const EA: Mat = [
  [1, 2, 3],
  [4, 5, 6],
];
export const EB: Mat = [
  [1, 2],
  [3, 4],
  [5, 6],
];
const flat = (x: number | Mat | number[]) => (typeof x === 'number' ? [x] : Array.isArray(x[0]) ? (x as Mat).flat() : (x as number[]));
const close = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= 1e-8 + 1e-5 * Math.abs(b[i]));
const show = (x: number | Mat | number[]) => (typeof x === 'number' ? String(x) : Array.isArray(x[0]) ? JSON.stringify(x).replace(/,/g, ', ') : `[${(x as number[]).join(', ')}]`);
const tEA = fromMat(EA);
const pairs: { spec: string; classic: string; e: number | Mat | number[]; c: number | Mat | number[] }[] = [
  { spec: "'ij->', A", classic: 'np.sum(A)', e: einsum('ij->', tEA).data[0], c: EA.flat().reduce((a, b) => a + b, 0) },
  { spec: "'ij->i', A", classic: 'np.sum(A, axis=1)', e: einsum('ij->i', tEA).data, c: EA.map((r) => r.reduce((a, b) => a + b, 0)) },
  { spec: "'ik,kj->ij', A, B", classic: 'A @ B', e: toMat(einsum('ik,kj->ij', tEA, fromMat(EB))), c: matmul(EA, EB) },
  { spec: "'ij->ji', A", classic: 'A.T', e: toMat(einsum('ij->ji', tEA)), c: transpose(EA) },
  { spec: "'ij,ij->', A, A", classic: 'np.sum(A * A)', e: einsum('ij,ij->', tEA, tEA).data[0], c: EA.flat().reduce((a, v) => a + v * v, 0) },
];
export const EQUIV = pairs.map((p) => ({ ...p, eShow: show(p.e), cShow: show(p.c), match: close(flat(p.e), flat(p.c)) }));
