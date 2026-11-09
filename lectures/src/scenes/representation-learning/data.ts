// Every number on screen in the Representation Learning lecture comes from here.
import { dot, gauss, matmul, mean, softmax, transpose, type Mat } from '../../lib/math';

const norm = (v: number[]) => Math.sqrt(dot(v, v));
export const unit = (v: number[]) => {
  const n = Math.max(norm(v), 1e-12);
  return v.map((x) => x / n);
};
export const cosine = (a: number[], b: number[]) => dot(a, b) / (Math.max(norm(a), 1e-12) * Math.max(norm(b), 1e-12));

// --- Chapter 1: a 2-D embedding space with three topics ---------------------
export const TOPICS = [
  { name: 'animals', angle: 0.35, words: ['cat', 'dog', 'horse'] },
  { name: 'vehicles', angle: 2.3, words: ['car', 'truck', 'bus'] },
  { name: 'fruit', angle: 4.1, words: ['apple', 'pear', 'mango'] },
];
function makePoints(seed: number) {
  const g = gauss(seed);
  return TOPICS.flatMap((t, ti) =>
    t.words.map((w) => {
      const a = t.angle + g() * 0.22;
      const r = 0.75 + Math.abs(g()) * 0.2;
      return { word: w, topic: ti, v: [r * Math.cos(a), r * Math.sin(a)] };
    }),
  );
}
const minSep = (pts: ReturnType<typeof makePoints>) => {
  let m = Infinity;
  pts.forEach((p, i) => pts.forEach((q, j) => {
    if (j > i) m = Math.min(m, Math.acos(Math.max(-1, Math.min(1, cosine(p.v, q.v)))));
  }));
  return m;
};
// Seed chosen as the first whose points are at least 0.2 rad apart, so labels stay legible.
let SEED1 = 3;
while (minSep(makePoints(SEED1)) < 0.2) SEED1++;
export const POINTS = makePoints(SEED1);
const P = (w: string) => POINTS.find((p) => p.word === w)!;
export const PAIRS = [
  { a: 'cat', b: 'dog' },
  { a: 'cat', b: 'truck' },
  { a: 'dog', b: 'mango' },
].map(({ a, b }) => ({ a, b, cos: cosine(P(a).v, P(b).v), angle: Math.acos(Math.max(-1, Math.min(1, cosine(P(a).v, P(b).v)))) }));

// --- Chapter 2: CLIP InfoNCE on a batch of N = 5 pairs ---------------------
export const CLIP_IMG = ['dog', 'beach', 'pizza', 'guitar', 'snow'];
export const CLIP_TXT = ['"dog"', '"beach"', '"pizza"', '"guitar"', '"snow"'];
export const N = 5;
export const TAU = 0.07;
const g2 = gauss(17);
const CONCEPTS: Mat = Array.from({ length: N }, () => Array.from({ length: 8 }, () => g2()));
// each encoder sees the shared concept plus its own noise
const IMG: Mat = CONCEPTS.map((c) => c.map((v) => v + 0.55 * g2()));
const TXT: Mat = CONCEPTS.map((c) => c.map((v) => v + 0.55 * g2()));
const IMG_N = IMG.map(unit);
const TXT_N = TXT.map(unit);
export const COS: Mat = matmul(IMG_N, transpose(TXT_N));
export const LOGITS: Mat = COS.map((r) => r.map((v) => v / TAU));
export const P_I2T: Mat = LOGITS.map(softmax);
export const P_T2I: Mat = transpose(transpose(LOGITS).map(softmax)); // column-wise softmax, shown in place
const ceDiag = (Z: Mat) => mean(Z.map((row, i) => -Math.log(softmax(row)[i])));
export const LOSS_I2T = ceDiag(LOGITS);
export const LOSS_T2I = ceDiag(transpose(LOGITS));
export const LOSS = (LOSS_I2T + LOSS_T2I) / 2;
/** the same row at temperature 1: barely distinguishes the match */
export const ROW0_TAU1 = softmax(COS[0]);
export const ROW0_TAU = P_I2T[0];

// --- Chapter 3: exact top-k search and an IVF-style approximate search ------
export const DOC_NAMES = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7'];
const g3 = gauss(29);
const DOCS: Mat = Array.from({ length: 8 }, () => Array.from({ length: 6 }, () => g3()));
DOCS[5] = DOCS[2].map((v) => v * 1.7); // same direction as d2: an exact cosine tie
export const DOCS_UNIT: Mat = DOCS.map(unit);
export const QUERY: number[] = DOCS[2].map((v, i) => v + 0.8 * g3() + 0.4 * DOCS[6][i]);
export const SEARCH_SCORES = DOCS.map((d) => cosine(QUERY, d));
export const TOPK = 3;
/** stable sort of -scores: ties keep the lower index */
export const ORDER = SEARCH_SCORES.map((s, i) => [s, i] as const)
  .sort((a, b) => Math.round((b[0] - a[0]) * 1e12) || a[1] - b[1])
  .map((x) => x[1]);

// IVF on a 2-D toy collection: 48 points in 4 clusters, probe the nearest centroid only
const g3b = gauss(91);
export const IVF_CENTERS = [
  [-0.55, 0.45],
  [0.5, 0.5],
  [-0.45, -0.5],
  [0.55, -0.45],
];
export const IVF_POINTS = Array.from({ length: 48 }, (_, i) => {
  const c = i % 4;
  return { c, v: [IVF_CENTERS[c][0] + g3b() * 0.17, IVF_CENTERS[c][1] + g3b() * 0.17] };
});
export const IVF_QUERY = [0.27, 0.12];
const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
export const IVF_PROBE = IVF_CENTERS.map((c, i) => [d2(c, IVF_QUERY), i] as const).sort((a, b) => a[0] - b[0])[0][1];
export const IVF_SCORED = IVF_POINTS.filter((p) => p.c === IVF_PROBE).length;
const nearest = (pts: typeof IVF_POINTS) => pts.reduce((best, p, i) => (d2(p.v, IVF_QUERY) < d2(pts[best].v, IVF_QUERY) ? i : best), 0);
export const IVF_TRUE_NN = nearest(IVF_POINTS);
export const IVF_FOUND_NN = IVF_POINTS.indexOf(IVF_POINTS.filter((p) => p.c === IVF_PROBE).reduce((b, p) => (d2(p.v, IVF_QUERY) < d2(b.v, IVF_QUERY) ? p : b)));

// --- Chapter 4: BM25 + embedding rerank ------------------------------------
export const K1 = 1.5;
export const B = 0.75;
export const CORPUS = [
  'reset your password from the login page',
  'error E42 means your password expired',
  'how to recover a forgotten password',
  'list of error codes E40 E41 E42 E43',
  'the login page loads slowly today',
];
export const QUERY_TEXT = 'password error E42';
const tok = (s: string) => s.toLowerCase().split(/\s+/);
const DOC_TOK = CORPUS.map(tok);
const Q_TOK = [...new Set(tok(QUERY_TEXT))];
const LENS = DOC_TOK.map((d) => d.length);
export const AVGDL = mean(LENS);
export const tfFactor = (tf: number, len: number) => (tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (len / AVGDL)));
export const IDF = Object.fromEntries(
  Q_TOK.map((t) => {
    const n = DOC_TOK.filter((d) => d.includes(t)).length;
    return [t, Math.log((CORPUS.length - n + 0.5) / (n + 0.5) + 1)];
  }),
) as Record<string, number>;
export const BM25 = DOC_TOK.map((d) =>
  Q_TOK.reduce((s, t) => {
    const tf = d.filter((x) => x === t).length;
    return s + IDF[t] * tfFactor(tf, d.length);
  }, 0),
);
export const N_CAND = 3;
export const CANDIDATES = BM25.map((s, i) => [s, i] as const)
  .sort((a, b) => b[0] - a[0] || a[1] - b[1])
  .slice(0, N_CAND)
  .map((x) => x[1]);
// Toy sentence embeddings: a shared "account access" topic plus seeded noise; the
// weight per document says how much it is about the query's meaning.
const g4 = gauss(12);
const TOPIC = Array.from({ length: 16 }, () => g4());
const RELEVANCE = [0.75, 0.9, 0.85, 0.15, 0.1];
const DOC_EMB = RELEVANCE.map((w) => TOPIC.map((v) => w * v + (1 - w) * 1.4 * g4()));
const Q_EMB = TOPIC.map((v) => v + 0.3 * g4());
export const COS_Q = DOC_EMB.map((e) => cosine(Q_EMB, e));
export const ALPHA = 0.5;
const maxB = Math.max(...CANDIDATES.map((c) => BM25[c]));
export const FUSED = CANDIDATES.map((c) => ({ doc: c, bm25n: BM25[c] / maxB, cos: COS_Q[c], fused: ALPHA * (BM25[c] / maxB) + (1 - ALPHA) * COS_Q[c] }));
export const RERANKED = [...FUSED].sort((a, b) => b.fused - a.fused);
