// Every number on screen in the CNN lecture comes from here.
import { rng, type Mat } from '../../lib/math';

const randInt = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));

/** The 2D Convolution problem: valid cross-correlation, stride 1, no padding. */
export function conv2d(img: Mat, k: Mat, stride = 1, pad = 0): Mat {
  const p = padZeros(img, pad);
  const kh = k.length;
  const kw = k[0].length;
  const oh = Math.floor((p.length - kh) / stride) + 1;
  const ow = Math.floor((p[0].length - kw) / stride) + 1;
  return Array.from({ length: oh }, (_, i) =>
    Array.from({ length: ow }, (_, j) => {
      let s = 0;
      for (let a = 0; a < kh; a++) for (let b = 0; b < kw; b++) s += p[i * stride + a][j * stride + b] * k[a][b];
      return s;
    }),
  );
}

export function padZeros(img: Mat, pad: number): Mat {
  if (pad === 0) return img;
  const w = img[0].length + 2 * pad;
  const zeros = () => new Array(w).fill(0);
  return [...Array.from({ length: pad }, zeros), ...img.map((r) => [...new Array(pad).fill(0), ...r, ...new Array(pad).fill(0)]), ...Array.from({ length: pad }, zeros)];
}

export const convOutputSize = (n: number, k: number, pad = 0, stride = 1) => Math.floor((n - k + 2 * pad) / stride) + 1;

// --- Chapter 1: a 7x7 image with a bright vertical band, and an edge kernel --
const r1 = rng(3);
export const IMG: Mat = Array.from({ length: 7 }, () => Array.from({ length: 7 }, (_, j) => (j >= 3 && j <= 4 ? randInt(r1, 7, 9) : randInt(r1, 0, 2))));
export const KERNEL: Mat = [
  [1, 0, -1],
  [1, 0, -1],
  [1, 0, -1],
];
export const OUT = conv2d(IMG, KERNEL);

// --- Chapter 2: padding and stride ------------------------------------------
const r2 = rng(21);
export const SMALL: Mat = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => randInt(r2, 0, 4)));
export const SMALL_K: Mat = [
  [0, 1, 0],
  [1, -4, 1],
  [0, 1, 0],
];
export const PAD = 1;
export const STRIDE = 2;
export const SMALL_PADDED = padZeros(SMALL, PAD);
export const SMALL_OUT = conv2d(SMALL, SMALL_K, STRIDE, PAD);
export const EX = { n: 32, k: 5, pad: 2, stride: 2 };
export const EX_OUT = convOutputSize(EX.n, EX.k, EX.pad, EX.stride);
export const CH = { cin: 4, cout: 4, k: 3 };
export const paramsFor = (groups: number) => CH.cout * (CH.cin / groups) * CH.k * CH.k;

// --- Chapter 3: pooling, flatten, residual block ------------------------------
const r3 = rng(18);
export const FMAP: Mat = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => randInt(r3, 0, 9)));
export function maxPool(m: Mat, size = 2): Mat {
  return Array.from({ length: Math.floor(m.length / size) }, (_, i) =>
    Array.from({ length: Math.floor(m[0].length / size) }, (_, j) => {
      let best = -Infinity;
      for (let a = 0; a < size; a++) for (let b = 0; b < size; b++) best = Math.max(best, m[i * size + a][j * size + b]);
      return best;
    }),
  );
}
export const POOLED = maxPool(FMAP);
// Shift the feature map one column right (pad with 0): the pooled result barely changes.
export const FMAP_SHIFT: Mat = FMAP.map((r) => [0, ...r.slice(0, 3)]);
export const POOLED_SHIFT = maxPool(FMAP_SHIFT);
export const POOL_SAME = POOLED.flat().filter((v, i) => v === POOLED_SHIFT.flat()[i]).length;

/** Flatten (batch, H, W, C) -> (batch, H*W*C), row-major: index = (h*W + w)*C + c */
export const FL = { h: 2, w: 2, c: 3 };
export const FLAT = Array.from({ length: FL.h * FL.w * FL.c }, (_, i) => ({ v: i, h: Math.floor(i / (FL.w * FL.c)), w: Math.floor(i / FL.c) % FL.w, c: i % FL.c }));

export const resOut = (h: number, stride: number) => Math.floor((h - 1) / stride) + 1;
export const RES = [
  { cin: 64, cout: 64, h: 56, stride: 1 },
  { cin: 64, cout: 128, h: 56, stride: 2 },
].map((b) => ({ ...b, hout: resOut(b.h, b.stride), projection: b.stride !== 1 || b.cin !== b.cout }));

// --- Chapter 4: IoU, NMS, Smooth L1 ------------------------------------------
export type Box = [number, number, number, number];
export function iou(a: Box, b: Box) {
  const iw = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const ih = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = iw * ih;
  const union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter;
  return { inter, union, iou: union > 0 ? inter / union : 0, ix: [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])] as Box };
}
export const BOX_A: Box = [1, 1, 6, 5];
export const BOX_B: Box = [3, 2, 8, 7];
export const IOU_AB = iou(BOX_A, BOX_B);

// Detections around two objects: jittered copies of two true boxes, with scores.
const r4 = rng(45);
const OBJECTS: Box[] = [
  [1.5, 1.5, 7.5, 7],
  [10, 2.5, 14.5, 8],
];
export const DETS = OBJECTS.flatMap((o, oi) =>
  Array.from({ length: oi === 0 ? 4 : 3 }, () => {
    const j = () => (r4() - 0.5) * 1.6;
    const b: Box = [o[0] + j(), o[1] + j(), o[2] + j(), o[3] + j()];
    return { box: b.map((v) => Math.round(v * 10) / 10) as Box, score: Math.round((0.5 + r4() * 0.49) * 100) / 100 };
  }),
);
export const NMS_T = 0.5;
/** The NMS problem: sort by score, keep the best, drop boxes with IoU > threshold, repeat. */
export function nms(dets: { box: Box; score: number }[], t: number) {
  const order = dets.map((_, i) => i).sort((a, b) => dets[b].score - dets[a].score);
  const kept: number[] = [];
  const steps: { keep: number; removed: { i: number; iou: number }[] }[] = [];
  let rest = [...order];
  while (rest.length) {
    const k = rest[0];
    kept.push(k);
    const removed: { i: number; iou: number }[] = [];
    rest = rest.slice(1).filter((i) => {
      const v = iou(dets[k].box, dets[i].box).iou;
      if (v > t) {
        removed.push({ i, iou: v });
        return false;
      }
      return true;
    });
    steps.push({ keep: k, removed });
  }
  return { order, kept, steps };
}
export const NMS = nms(DETS, NMS_T);

export const BETA = 1;
export const smoothL1 = (x: number, beta = BETA) => (Math.abs(x) < beta ? (0.5 * x * x) / beta : Math.abs(x) - 0.5 * beta);
export const curve = (f: (x: number) => number, lo: number, hi: number, n = 121) =>
  Array.from({ length: n }, (_, i) => {
    const x = lo + ((hi - lo) * i) / (n - 1);
    return [x, f(x)] as [number, number];
  });

// --- Chapter 5: focal loss and segmentation metrics --------------------------
export const GAMMAS = [0, 1, 2, 5];
/** Focal loss for the true class, alpha_t left out: -(1 - p_t)^gamma log(p_t). */
export const focal = (pt: number, gamma: number) => -((1 - pt) ** gamma) * Math.log(pt);
export const EASY_PT = 0.9;
export const HARD_PT = 0.1;

export const SEG_N = 12;
const disk = (cx: number, cy: number, r: number): Mat =>
  Array.from({ length: SEG_N }, (_, i) => Array.from({ length: SEG_N }, (_, j) => ((i + 0.5 - cy) ** 2 + (j + 0.5 - cx) ** 2 <= r * r ? 1 : 0)));
export const TARGET = disk(5, 6, 2.6);
export const PRED = disk(6, 5.5, 2.8);
export function segMetrics(pred: Mat, target: Mat) {
  let inter = 0;
  let sp = 0;
  let st = 0;
  let correct = 0;
  pred.forEach((r, i) =>
    r.forEach((p, j) => {
      const t = target[i][j];
      inter += p * t;
      sp += p;
      st += t;
      if (p === t) correct++;
    }),
  );
  const union = sp + st - inter;
  const n = pred.length * pred[0].length;
  return { inter, union, sp, st, correct, n, iou: inter / union, acc: correct / n, dice: (2 * inter) / (sp + st) };
}
export const SEG = segMetrics(PRED, TARGET);
