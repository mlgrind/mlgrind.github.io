import { Problem } from '../../types';

export const representationLearningProblems: Problem[] = [
  {
    id: 'infonce-loss',
    title: 'CLIP Contrastive Loss (InfoNCE)',
    section: 'representation-learning',
    difficulty: 'medium',
    description: `
## Symmetric InfoNCE (CLIP)

CLIP (Radford et al., 2021) learns a shared embedding space for images and text from (image, caption) pairs. In a batch of N pairs, the i-th image and i-th caption are a **positive** pair, and the other N − 1 captions are **negatives** for that image (and vice versa).

### Steps
1. **L2-normalise** each embedding (rows of both matrices) so dot products are cosine similarities:
\`\`\`
img_n = img / ||img||,   txt_n = txt / ||txt||      (per row; clamp the norm at 1e-12)
\`\`\`
2. **Similarity logits**, scaled by a temperature τ:
\`\`\`
logits = img_n @ txt_nᵀ / τ                         (N, N)
\`\`\`
3. **Cross-entropy in both directions**, with the correct match on the diagonal (labels = 0, 1, ..., N−1):
\`\`\`
loss_i2t = CE(logits,   labels)    each image picks its caption among N captions (rows)
loss_t2i = CE(logitsᵀ,  labels)    each caption picks its image among N images (columns)
CE(Z, y) = mean_i [ logsumexp(Z_i) - Z_{i, y_i} ]
\`\`\`
4. **Average** the two: \`loss = (loss_i2t + loss_t2i) / 2\`

A lower temperature sharpens the softmax; CLIP learns τ (initialised to 0.07). Use a numerically stable log-sum-exp.

### Expected Return Format
\`clip_loss(img_emb, txt_emb, temperature=0.07)\` returns a dictionary:
- \`'logits'\`: (N, N) array of scaled cosine similarities (row = image, column = text)
- \`'loss_i2t'\`: image-to-text cross-entropy (Python float)
- \`'loss_t2i'\`: text-to-image cross-entropy (Python float)
- \`'loss'\`: their mean (Python float)
    `,
    examples: [
      {
        input: 'img = txt = [[1, 0], [0, 1]], temperature = 1.0',
        output: "{'loss': 0.3133, ...}",
        explanation: 'logits = I, so each row is softmax([1, 0]) and CE = log(1 + e^-1) = 0.3133 in both directions',
      },
    ],
    starterCode: `import numpy as np

def clip_loss(img_emb, txt_emb, temperature=0.07):
    """
    Symmetric InfoNCE loss used by CLIP.

    Args:
        img_emb: (N, D) image embeddings (row i pairs with txt_emb row i)
        txt_emb: (N, D) text embeddings
        temperature: softmax temperature τ

    Returns:
        dict with 'logits' (N, N), 'loss_i2t', 'loss_t2i', 'loss' (floats)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Perfectly aligned pairs, temperature 1',
        input: "round(clip_loss(np.eye(2), np.eye(2), 1.0)['loss'], 4)",
        expected: '0.3133',
        hidden: false,
      },
      {
        id: '2',
        description: 'Logits shape and range (|cos| / τ <= 1 / τ)',
        input: `(lambda r: (r['logits'].shape, bool(np.all(np.abs(r['logits']) <= 1 / 0.1 + 1e-9))))(clip_loss(np.random.randn(4, 8), np.random.randn(4, 8), 0.1))`,
        expected: '((4, 4), True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Asymmetric batch: both directions and the mean (values)',
        input: `(lambda r: (round(r['loss_i2t'], 4), round(r['loss_t2i'], 4), round(r['loss'], 4)))(clip_loss(
    np.array([[1.0, 0.0], [0.6, 0.8], [0.0, 1.0]]),
    np.array([[0.8, 0.6], [0.0, 1.0], [1.0, 1.0]]), 0.5))`,
        expected: '(1.1121, 1.1433, 1.1277)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Embeddings are L2-normalised: rescaling the rows changes nothing',
        input: `(lambda: (
    a := np.random.randn(5, 6), b := np.random.randn(5, 6),
    s := np.array([[0.5], [2.0], [3.0], [0.1], [7.0]]),
    bool(np.isclose(clip_loss(a * s, b * s[::-1], 0.2)['loss'], clip_loss(a, b, 0.2)['loss']))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Lower temperature lowers the loss for aligned pairs',
        input: "(lambda: (round(clip_loss(np.eye(3), np.eye(3), 0.5)['loss'], 4), round(clip_loss(np.eye(3), np.eye(3), 0.1)['loss'], 4)))()",
        expected: '(0.2395, 0.0001)',
        hidden: true,
      },
    ],
    hints: [
      'Normalise rows: x / np.maximum(np.linalg.norm(x, axis=1, keepdims=True), 1e-12)',
      'logits = img_n @ txt_n.T / temperature; the correct pairs are on the diagonal',
      'Stable CE: subtract the row max, log-sum-exp each row, and take -mean of the diagonal log-probs',
      'loss_t2i is the same CE applied to logits.T',
    ],
    solution: `import numpy as np

def _l2_normalize(x, eps=1e-12):
    return x / np.maximum(np.linalg.norm(x, axis=1, keepdims=True), eps)


def _cross_entropy_diag(logits):
    # Correct class for row i is column i
    z = logits - logits.max(axis=1, keepdims=True)
    log_probs = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return float(-np.mean(np.diag(log_probs)))


def clip_loss(img_emb, txt_emb, temperature=0.07):
    img = _l2_normalize(np.asarray(img_emb, dtype=float))
    txt = _l2_normalize(np.asarray(txt_emb, dtype=float))

    logits = img @ txt.T / temperature        # (N, N) cosine / τ

    loss_i2t = _cross_entropy_diag(logits)    # rows: image -> texts
    loss_t2i = _cross_entropy_diag(logits.T)  # columns: text -> images

    return {
        'logits': logits,
        'loss_i2t': loss_i2t,
        'loss_t2i': loss_t2i,
        'loss': (loss_i2t + loss_t2i) / 2,
    }
`,
  },
  {
    id: 'embedding-search',
    title: 'Cosine Top-k Embedding Search',
    section: 'representation-learning',
    difficulty: 'easy',
    description: `
## Dense Retrieval with Cosine Similarity

Vector search finds the documents whose embeddings are closest to a query embedding. With L2-normalised vectors, cosine similarity is a plain dot product, so scoring every document for a batch of queries is one matrix multiply. (Vector databases use approximate indexes such as HNSW or IVF to avoid scoring everything; this is the exact brute-force version they approximate.)

### Steps
\`\`\`
q_n = queries / ||queries||        (Q, D), per row; clamp the norm at 1e-12
d_n = docs / ||docs||              (N, D)
scores = q_n @ d_nᵀ                (Q, N) cosine similarities
\`\`\`
For each query, return the k best documents sorted by score **descending**. When two documents have exactly the same score, the one with the **lower index comes first** (a stable sort of the negated scores does this; \`np.argpartition\` and \`torch.topk\` don't guarantee it).

### Expected Return Format
\`cosine_topk(queries, docs, k)\` returns a tuple \`(indices, scores)\`:
- \`indices\`: (Q, k) integer array of document indices, best first
- \`scores\`: (Q, k) array of the matching cosine similarities (non-increasing along each row)
    `,
    examples: [
      {
        input: 'queries = [[1, 0]], docs = [[1, 0], [0, 1], [1, 1], [-1, 0]], k = 2',
        output: 'indices = [[0, 2]], scores = [[1.0, 0.7071]]',
        explanation: 'Doc 0 points the same way as the query; doc 2 is at 45 degrees',
      },
    ],
    starterCode: `import numpy as np

def cosine_topk(queries, docs, k):
    """
    Exact top-k retrieval by cosine similarity.

    Args:
        queries: (Q, D) query embeddings
        docs: (N, D) document embeddings
        k: number of results per query

    Returns:
        (indices (Q, k), scores (Q, k)), sorted by score descending,
        ties broken by lower document index
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Top-2 indices for a single query',
        input: 'cosine_topk(np.array([[1.0, 0.0]]), np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [-1.0, 0.0]]), 2)[0].tolist()',
        expected: '[[0, 2]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Top-2 scores for a single query',
        input: 'np.round(cosine_topk(np.array([[1.0, 0.0]]), np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [-1.0, 0.0]]), 2)[1], 4).tolist()',
        expected: '[[1.0, 0.7071]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Ties are broken by the lower document index',
        input: 'cosine_topk(np.array([[1.0, 0.0]]), np.array([[0.0, 3.0], [2.0, 0.0], [1.0, 1.0], [1.0, 0.0], [5.0, 0.0]]), 4)[0].tolist()',
        expected: '[[1, 3, 4, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Batch of queries: indices and scores (values)',
        input: `(lambda r: (r[0].tolist(), np.round(r[1], 4).tolist()))(cosine_topk(
    np.array([[1.0, 2.0, 0.0], [0.0, -1.0, 2.0]]),
    np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 1.0, 1.0], [2.0, 4.0, 0.5]]), 3))`,
        expected: '([[4, 1, 3], [2, 3, 0]], [[0.9938, 0.8944, 0.7746], [0.8944, 0.2582, 0.0]])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Random corpus: scores are sorted and match the returned documents',
        input: `(lambda: (
    Q := np.random.randn(3, 16), Dm := np.random.randn(50, 16),
    r := cosine_topk(Q, Dm, 5),
    cos := (Q / np.linalg.norm(Q, axis=1, keepdims=True)) @ (Dm / np.linalg.norm(Dm, axis=1, keepdims=True)).T,
    bool(np.all(np.diff(r[1], axis=1) <= 0) and np.allclose(np.take_along_axis(cos, r[0], axis=1), r[1])
         and np.allclose(r[1][:, 0], cos.max(axis=1)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Normalise both matrices row-wise, then scores = q_n @ d_n.T',
      'np.argsort(-scores, axis=1, kind="stable") sorts descending and keeps equal scores in index order',
      'Keep the first k columns, then np.take_along_axis(scores, idx, axis=1) for the scores',
    ],
    solution: `import numpy as np

def _l2_normalize(x, eps=1e-12):
    return x / np.maximum(np.linalg.norm(x, axis=1, keepdims=True), eps)


def cosine_topk(queries, docs, k):
    q = _l2_normalize(np.asarray(queries, dtype=float))
    d = _l2_normalize(np.asarray(docs, dtype=float))
    scores = q @ d.T                                        # (Q, N)

    # Stable sort of -scores: descending, ties keep the lower index first
    order = np.argsort(-scores, axis=1, kind='stable')[:, :k]
    top_scores = np.take_along_axis(scores, order, axis=1)
    return order, top_scores
`,
  },
  {
    id: 'retrieve-and-rerank',
    title: 'RAG Retrieval: BM25 + Embedding Rerank',
    section: 'representation-learning',
    difficulty: 'medium',
    description: `
## Hybrid Retrieval for RAG

A retrieval-augmented generation (RAG) system first **retrieves** a few passages, then pastes them into the LLM's prompt. A common recipe is two-stage: a cheap lexical retriever (BM25) picks candidates, then a semantic signal (embedding similarity) **reranks** them.

### Stage 1: BM25 (Robertson & Zaragoza)
For a query q and document d (both lists of tokens):
\`\`\`
score(q, d) = Σ_{t in unique(q)}  IDF(t) · f(t,d) · (k1 + 1) / ( f(t,d) + k1 · (1 - b + b · |d| / avgdl) )

IDF(t) = ln( (N - n_t + 0.5) / (n_t + 0.5) + 1 )
\`\`\`
- f(t, d): count of term t in d; |d|: number of tokens in d; avgdl: mean document length
- N: number of documents; n_t: number of documents containing t
- The \`+ 1\` inside the log (the Lucene variant) keeps IDF positive even for very common terms
- Defaults: **k1 = 1.5** (term-frequency saturation), **b = 0.75** (length normalisation)
- Each distinct query term counts once, in order of first appearance

### Stage 2: candidates
Take the top-n documents by BM25 (descending; ties go to the lower document index).

### Stage 3: rerank with weighted score fusion
For each candidate c, with \`cos_c\` the cosine similarity between the query embedding and the candidate's embedding:
\`\`\`
bm25_norm_c = bm25_c / max_{c' in candidates} bm25_c'      (0 for all if that max is 0)
fused_c     = alpha · bm25_norm_c + (1 - alpha) · cos_c
\`\`\`
Sort candidates by \`fused\` descending; ties keep the BM25 candidate order. Dividing by the max puts BM25 on a [0, 1] scale like cosine. (Reciprocal rank fusion, which adds 1 / (60 + rank) from each ranker, is a common alternative that ignores raw scores; this problem uses the weighted fusion above.)

### Expected Return Format
- \`bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75)\` returns an (N,) array of BM25 scores
- \`retrieve_and_rerank(query_tokens, docs_tokens, query_emb, doc_embs, n=3, alpha=0.5, k1=1.5, b=0.75)\` returns a dictionary:
  - \`'bm25'\`: (N,) BM25 scores of every document
  - \`'candidates'\`: (n,) integer array of the top-n document indices by BM25
  - \`'reranked'\`: (n,) the same documents in fused order
  - \`'fused'\`: (n,) fused scores, aligned with \`'reranked'\`
    `,
    examples: [
      {
        input: "query = ['cat', 'pet'], 5 short documents",
        output: 'bm25 = [0.5133, 0.0, 0.5576, 0.0, 1.8336], candidates = [4, 2, 0], reranked = [0, 2, 4]',
        explanation: "BM25 ranks doc 4 (it contains both words) first, but doc 0's embedding is closest to the query, so the rerank moves it to the top. Doc 1 ('cats', 'pets') scores 0 because BM25 matches exact tokens (no stemming)",
      },
    ],
    starterCode: `import numpy as np

def bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75):
    """
    BM25 score of every document for one query.

    Args:
        query_tokens: list of query tokens
        docs_tokens: list of N token lists
        k1, b: BM25 parameters

    Returns:
        (N,) array of scores
    """
    # Your code here
    pass


def retrieve_and_rerank(query_tokens, docs_tokens, query_emb, doc_embs,
                        n=3, alpha=0.5, k1=1.5, b=0.75):
    """
    BM25 top-n, then rerank by alpha * normalised BM25 + (1 - alpha) * cosine.

    Args:
        query_emb: (D,) query embedding
        doc_embs: (N, D) document embeddings

    Returns:
        dict with 'bm25' (N,), 'candidates' (n,), 'reranked' (n,), 'fused' (n,)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'BM25 scores of a tiny corpus',
        input: `(lambda scores: [round(float(s), 4) for s in scores])(bm25_scores(['cat', 'pet'], [s.split() for s in [
    'the cat sat on the mat', 'dogs and cats are pets', 'the cat chased the mouse',
    'stock markets fell sharply today', 'a cat is a small pet']]))`,
        expected: '[0.5133, 0.0, 0.5576, 0.0, 1.8336]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Candidates and reranked order',
        input: `(lambda r: (r['candidates'].tolist(), r['reranked'].tolist()))(retrieve_and_rerank(['cat', 'pet'], [s.split() for s in [
    'the cat sat on the mat', 'dogs and cats are pets', 'the cat chased the mouse',
    'stock markets fell sharply today', 'a cat is a small pet']],
    np.array([1.0, 0.5, 0.0]),
    np.array([[1.0, 0.5, 0.0], [0.9, 0.6, 0.0], [0.6, 0.6, 0.4], [0.0, 0.1, 1.0], [0.0, 0.3, 1.0]]), n=3, alpha=0.5))`,
        expected: '([4, 2, 0], [0, 2, 4])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Fused scores (values)',
        input: `(lambda r: [round(float(s), 4) for s in r['fused']])(retrieve_and_rerank(['cat', 'pet'], [s.split() for s in [
    'the cat sat on the mat', 'dogs and cats are pets', 'the cat chased the mouse',
    'stock markets fell sharply today', 'a cat is a small pet']],
    np.array([1.0, 0.5, 0.0]),
    np.array([[1.0, 0.5, 0.0], [0.9, 0.6, 0.0], [0.6, 0.6, 0.4], [0.0, 0.1, 1.0], [0.0, 0.3, 1.0]]), n=3, alpha=0.5))`,
        expected: '[0.64, 0.5811, 0.5643]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Repeated terms saturate (k1) and long documents are penalised (b)',
        input: `(lambda scores: [round(float(s), 4) for s in scores])(bm25_scores(['ml'], [['ml'], ['ml', 'ml', 'ml', 'ml'], ['ml', 'x', 'y', 'z', 'w', 'v'], ['x']], k1=1.2, b=0.75))`,
        expected: '[0.4904, 0.5707, 0.2531, 0.0]',
        hidden: true,
      },
      {
        id: '5',
        description: 'alpha = 1 keeps the BM25 order; alpha = 0 sorts by cosine; ties keep BM25 order',
        input: `(lambda docs, E: (
    retrieve_and_rerank(['cat'], docs, np.array([0.0, 1.0]), E, n=3, alpha=1.0)['reranked'].tolist(),
    retrieve_and_rerank(['cat'], docs, np.array([0.0, 1.0]), E, n=3, alpha=0.0)['reranked'].tolist(),
))([s.split() for s in ['cat cat dog', 'cat', 'dog bird', 'a cat b c']],
   np.array([[1.0, 0.0], [1.0, 0.0], [0.0, 1.0], [0.0, 1.0]]))`,
        expected: '([1, 0, 3], [3, 1, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Precompute N, the document lengths and avgdl; loop over dict.fromkeys(query_tokens) to get unique terms in order',
      'For each term: tf = np.array([d.count(t) for d in docs]); n_t = np.count_nonzero(tf); idf = np.log((N - n_t + 0.5) / (n_t + 0.5) + 1)',
      'Candidates: np.argsort(-bm25, kind="stable")[:n]',
      'Cosine of the query against doc_embs[candidates]; fused = alpha * bm25_c / bm25_c.max() + (1 - alpha) * cos; stable argsort of -fused',
    ],
    solution: `import numpy as np

def bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75):
    N = len(docs_tokens)
    lengths = np.array([len(d) for d in docs_tokens], dtype=float)
    avgdl = lengths.mean()
    scores = np.zeros(N)
    for term in dict.fromkeys(query_tokens):          # unique terms, in order
        tf = np.array([d.count(term) for d in docs_tokens], dtype=float)
        n_t = np.count_nonzero(tf)
        idf = np.log((N - n_t + 0.5) / (n_t + 0.5) + 1.0)
        scores += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * lengths / avgdl))
    return scores


def retrieve_and_rerank(query_tokens, docs_tokens, query_emb, doc_embs,
                        n=3, alpha=0.5, k1=1.5, b=0.75):
    bm25 = bm25_scores(query_tokens, docs_tokens, k1, b)
    candidates = np.argsort(-bm25, kind='stable')[:n]

    # Cosine similarity between the query and each candidate
    q = np.asarray(query_emb, dtype=float)
    D = np.asarray(doc_embs, dtype=float)[candidates]
    cos = D @ q / (np.linalg.norm(D, axis=1) * np.linalg.norm(q) + 1e-12)

    cand_bm25 = bm25[candidates]
    top = cand_bm25.max()
    bm25_norm = cand_bm25 / top if top > 0 else np.zeros_like(cand_bm25)
    fused = alpha * bm25_norm + (1 - alpha) * cos

    order = np.argsort(-fused, kind='stable')         # ties keep BM25 order
    return {
        'bm25': bm25,
        'candidates': candidates,
        'reranked': candidates[order],
        'fused': fused[order],
    }
`,
  },
];
