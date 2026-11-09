// Every number on screen in the LLM Generation lecture comes from here.
import { gauss, matmul, randn, rng, softmax, transpose, type Mat } from '../../lib/math';

// --- Chapter 1: logits for the next token after "the cat sat on the" -------
export const PROMPT = 'the cat sat on the';
export const VOCAB = ['mat', 'floor', 'sofa', 'bed', 'roof', 'table', 'moon', 'idea'];
const g1 = gauss(11);
/** sorted so the most likely candidate comes first */
export const LOGITS: number[] = Array.from({ length: VOCAB.length }, () => g1() * 1.6 + 0.6).sort((a, b) => b - a);
export const softmaxT = (logits: number[], T: number) => softmax(logits.map((l) => l / T));
export const TEMPS = [1, 0.5, 0.1, 2, 5];

// --- Chapter 2: top-k, top-p, repetition penalty ----------------------------
export const P1 = softmaxT(LOGITS, 1);
export const TOP_K = 3;
export function topK(p: number[], k: number) {
  const idx = p.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]).slice(0, k).map((x) => x[1]);
  const kept = p.map((v, i) => (idx.includes(i) ? v : 0));
  const s = kept.reduce((a, b) => a + b, 0);
  return kept.map((v) => v / s);
}
export const P_TOPK = topK(P1, TOP_K);

export const TOP_P = 0.9;
/** nucleus: smallest prefix (in sorted order) whose cumulative sum reaches p, including the crossing token */
export function topP(p: number[], pThresh: number) {
  const order = p.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0]);
  const cum: number[] = [];
  order.reduce((s, [v]) => (cum.push(s + v), s + v), 0);
  let cut = cum.findIndex((c) => c >= pThresh);
  if (cut < 0) cut = order.length - 1;
  const keep = new Set(order.slice(0, cut + 1).map((x) => x[1]));
  const kept = p.map((v, i) => (keep.has(i) ? v : 0));
  const s = kept.reduce((a, b) => a + b, 0);
  return { order: order.map((x) => x[1]), sorted: order.map((x) => x[0]), cum, kept: cut + 1, probs: kept.map((v) => v / s) };
}
/** a confident and a flat distribution over the same candidates */
export const P_CONFIDENT = softmaxT(LOGITS, 0.35);
export const P_FLAT = softmaxT(LOGITS, 3);
export const NUC_CONF = topP(P_CONFIDENT, TOP_P);
export const NUC_FLAT = topP(P_FLAT, TOP_P);
export const NUC_P1 = topP(P1, TOP_P);

export const PENALTY = 1.2;
/** tokens already generated: the top candidate (positive logit) and one with a negative logit */
export const GENERATED = [0, LOGITS.findIndex((l) => l < 0)];
export const LOGITS_PEN = LOGITS.map((l, i) => (GENERATED.includes(i) ? (l > 0 ? l / PENALTY : l * PENALTY) : l));
export const P_PEN = softmax(LOGITS_PEN);

// --- Chapter 3: KV cache ----------------------------------------------------
export const KV_TOKENS = ['the', 'cat', 'sat', 'on', 'the', 'mat'];
export const KV_D = 4;
const g3 = gauss(23);
const XKV: Mat = randn(g3, KV_TOKENS.length, KV_D);
const WQ: Mat = randn(g3, KV_D, KV_D, 1 / Math.sqrt(KV_D));
const WK: Mat = randn(g3, KV_D, KV_D, 1 / Math.sqrt(KV_D));
const WV: Mat = randn(g3, KV_D, KV_D, 1 / Math.sqrt(KV_D));
export const KQ = matmul(XKV, WQ);
export const KK = matmul(XKV, WK);
export const KV_V = matmul(XKV, WV);
/** attention weights of the newest token's query over the cached keys, per step */
export const KV_ATTN = KV_TOKENS.map((_, t) => {
  const q = [KQ[t]];
  const s = matmul(q, transpose(KK.slice(0, t + 1)))[0].map((v) => v / Math.sqrt(KV_D));
  return softmax(s);
});
/** K/V rows projected up to step n: naive recomputes the prefix, the cache does one row */
export const naiveRows = (n: number) => (n * (n + 1)) / 2;
export const cachedRows = (n: number) => n;

// --- Chapter 4: beam search -------------------------------------------------
export const BEAM_VOCAB = ['a', 'the', 'one'];
export const BEAM_WIDTH = 2;
export const BEAM_STEPS = 3;
/** A toy "model": next-token log probabilities as a deterministic function of the prefix. */
function makeModel(seed: number) {
  return (prefix: number[]) => {
    let h = seed;
    for (const t of prefix) h = Math.imul(h ^ (t + 7), 2654435761) >>> 0;
    const r = rng(h + prefix.length * 977);
    const logits = BEAM_VOCAB.map(() => (r() - 0.5) * 4);
    return softmax(logits).map(Math.log);
  };
}
export interface BeamNode {
  seq: number[];
  score: number;
  kept: boolean;
}
function runBeam(model: (p: number[]) => number[]) {
  let beams: { seq: number[]; score: number }[] = [{ seq: [], score: 0 }];
  const levels: BeamNode[][] = [];
  for (let step = 0; step < BEAM_STEPS; step++) {
    const cands = beams.flatMap((b) => model(b.seq).map((lp, t) => ({ seq: [...b.seq, t], score: b.score + lp })));
    const sorted = [...cands].sort((a, b) => b.score - a.score);
    const keep = new Set(sorted.slice(0, BEAM_WIDTH));
    levels.push(cands.map((c) => ({ ...c, kept: keep.has(c) })));
    beams = sorted.slice(0, BEAM_WIDTH);
  }
  return { levels, best: beams[0] };
}
function runGreedy(model: (p: number[]) => number[]) {
  const seq: number[] = [];
  let score = 0;
  for (let step = 0; step < BEAM_STEPS; step++) {
    const lp = model(seq);
    const t = lp.indexOf(Math.max(...lp));
    seq.push(t);
    score += lp[t];
  }
  return { seq, score };
}
// Seed chosen as the first one where greedy and beam search disagree (the case worth showing).
let BEAM_SEED = 1;
for (; BEAM_SEED < 500; BEAM_SEED++) {
  const m = makeModel(BEAM_SEED);
  const b = runBeam(m);
  const g = runGreedy(m);
  if (b.best.score > g.score + 0.3 && b.best.seq[0] !== g.seq[0]) break;
}
const MODEL = makeModel(BEAM_SEED);
export const BEAM = runBeam(MODEL);
export const GREEDY = runGreedy(MODEL);
export const BEAM_FIRST_LP = MODEL([]);

// --- Chapter 5: speculative decoding ---------------------------------------
export const SPEC_VOCAB = ['on', 'the', 'mat', 'and', 'slept', 'a'];
export const SPEC_K = 4;
function dist(r: () => number, sharp: number) {
  return softmax(SPEC_VOCAB.map(() => (r() - 0.5) * sharp));
}
function sample(p: number[], u: number) {
  let c = 0;
  for (let i = 0; i < p.length; i++) {
    c += p[i];
    if (u < c) return i;
  }
  return p.length - 1;
}
function makeSpec(seed: number) {
  const r = rng(seed);
  const steps = Array.from({ length: SPEC_K }, () => {
    const target = dist(r, 5);
    // the draft model is a noisy approximation of the target
    const noise = dist(r, 3);
    const draft = target.map((v, i) => 0.6 * v + 0.4 * noise[i]);
    const token = sample(draft, r());
    const ratio = target[token] / draft[token];
    const accept = Math.min(1, ratio);
    const u = r();
    return { target, draft, token, ratio, accept, u, ok: u < accept };
  });
  const firstReject = steps.findIndex((s) => !s.ok);
  return { steps, firstReject };
}
// Seed chosen as the first one with two acceptances and then a rejection.
let SPEC_SEED = 1;
for (; SPEC_SEED < 2000; SPEC_SEED++) {
  const s = makeSpec(SPEC_SEED);
  if (s.firstReject === 2 && s.steps[0].ratio < 1 && s.steps[1].ratio >= 1) break;
}
export const SPEC = makeSpec(SPEC_SEED);
const rej = SPEC.steps[SPEC.firstReject];
const resid = rej.target.map((p, i) => Math.max(0, p - rej.draft[i]));
const rs = resid.reduce((a, b) => a + b, 0);
export const RESIDUAL = resid.map((v) => v / rs);
export const REJ = rej;

/** Monte Carlo check: one speculative step (draft, accept or resample) reproduces the target. */
export const MC_TRIALS = 20000;
export const MC_HIST = (() => {
  const r = rng(99);
  const counts = new Array(SPEC_VOCAB.length).fill(0);
  for (let n = 0; n < MC_TRIALS; n++) {
    const x = sample(rej.draft, r());
    const a = Math.min(1, rej.target[x] / rej.draft[x]);
    counts[r() < a ? x : sample(RESIDUAL, r())]++;
  }
  return counts.map((c) => c / MC_TRIALS);
})();
