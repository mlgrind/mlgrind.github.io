import { Problem } from '../../types';

export const representationLearningProblems: Problem[] = [
  {
    id: 'infonce-loss',
    title: 'CLIP Contrastive Loss (InfoNCE)',
    section: 'representation-learning',
    difficulty: 'medium',
    description: `
## Symmetric InfoNCE (CLIP Loss)

### What you'll build
The contrastive loss CLIP is trained with: L2-normalize image and text embeddings, build the temperature-scaled cosine similarity matrix, and average the cross-entropy over both directions with the matching pairs on the diagonal.

### Background
CLIP (Radford et al., 2021) learns one embedding space for images and text from 400M (image, caption) pairs, with no class labels. In a batch of \`N\` pairs, image \`i\` and caption \`i\` are a **positive** pair; the other \`N - 1\` captions are **negatives** for that image, and vice versa. The same loss trains text embedding models for retrieval (with (query, passage) pairs), SimCLR (two augmentations of one image) and many more. More negatives make the task harder and the representation better, which is why these models are trained with very large batches.

### Formula
\`\`\`text
img_n  = img / max(||img||, 1e-12)                    # per row, (N, D)
txt_n  = txt / max(||txt||, 1e-12)                    # per row, (N, D)
logits = img_n @ txt_n.T / tau                        # (N, N); row = image, column = text

CE(Z)    = mean_i [ logsumexp(Z[i, :]) - Z[i, i] ]    # correct class of row i is column i
loss_i2t = CE(logits)                                 # each image picks its caption among N
loss_t2i = CE(logits.T)                               # each caption picks its image among N
loss     = (loss_i2t + loss_t2i) / 2
\`\`\`
A lower temperature \`tau\` sharpens the softmax; CLIP learns it (initialised to 0.07).

### Inputs
- \`img_emb\`: float array \`(N, D)\`; row \`i\` pairs with \`txt_emb\` row \`i\`
- \`txt_emb\`: float array \`(N, D)\`
- \`temperature\`: float \`> 0\`, default 0.07

### Expected Return Format
A dictionary:
- \`'logits'\`: \`(N, N)\` array of scaled cosine similarities (row = image, column = text)
- \`'loss_i2t'\`: image-to-text cross-entropy (Python float)
- \`'loss_t2i'\`: text-to-image cross-entropy (Python float)
- \`'loss'\`: their mean (Python float)

### Edge cases and conventions
- Normalize the **rows** (each embedding), not the columns; rescaling an embedding must not change the loss.
- Use a stable log-sum-exp: with \`tau = 0.07\` logits reach about 14, and smaller temperatures go higher.
- The matrix is not symmetric in general, so \`loss_i2t != loss_t2i\`.

### Constraints
NumPy only, vectorised (no loop over the batch).

### Follow-up
- With \`N\` pairs, the loss of a random model is about \`log N\`. Why? What does that say about comparing losses across batch sizes?
- SigLIP replaces the softmax with independent sigmoid losses per pair. What does that buy for distributed training?
`,
    examples: [
      {
        input: 'clip_loss(np.eye(2), np.eye(2), temperature=1.0)',
        output: "{'logits': [[1.0, 0.0], [0.0, 1.0]], 'loss_i2t': 0.3133, 'loss_t2i': 0.3133, 'loss': 0.3133}",
        explanation: 'Each row is softmax([1, 0]), so CE = log(1 + e^-1) = 0.3133 in both directions.',
      },
      {
        input: 'clip_loss(np.array([[1.0, 0.0], [0.6, 0.8], [0.0, 1.0]]), np.array([[0.8, 0.6], [0.0, 1.0], [1.0, 1.0]]), temperature=0.5)',
        output: "{'loss_i2t': 1.1121, 'loss_t2i': 1.1433, 'loss': 1.1277, ...}",
        explanation: 'logits = [[1.6, 0, 1.4142], [1.92, 1.6, 1.9799], [1.2, 2.0, 1.4142]]: image 1 is closer to captions 0 and 2 than to its own, so the loss is high, and the two directions differ.',
      },
    ],
    starterCode: `import numpy as np

def clip_loss(img_emb, txt_emb, temperature=0.07):
    """
    Symmetric InfoNCE loss used by CLIP.

    Args:
        img_emb: (N, D) image embeddings (row i pairs with txt_emb row i)
        txt_emb: (N, D) text embeddings
        temperature: softmax temperature tau

    Returns:
        dict with 'logits' (N, N) = cos / tau (row = image), and the Python
        floats 'loss_i2t', 'loss_t2i' and 'loss' (their mean)
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
        description: 'Logits shape and range (|cos| / tau <= 1 / tau)',
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
      {
        id: '6',
        description: 'Logits values (row = image, column = text)',
        input: `np.round(clip_loss(np.array([[1.0, 0.0], [0.6, 0.8], [0.0, 1.0]]), np.array([[0.8, 0.6], [0.0, 1.0], [1.0, 1.0]]), 0.5)['logits'], 4).tolist()`,
        expected: '[[1.6, 0.0, 1.4142], [1.92, 1.6, 1.9799], [1.2, 2.0, 1.4142]]',
        hidden: true,
      },
    ],
    hints: [
      'This is ordinary classification twice: each image is a sample whose N classes are the captions (and vice versa), and the correct class is on the diagonal.',
      'Normalize both matrices row-wise, build the (N, N) logits, then take a cross-entropy over rows and another over columns (rows of the transpose).',
      'x / np.maximum(np.linalg.norm(x, axis=1, keepdims=True), 1e-12); logits = img_n @ txt_n.T / temperature; log_probs = z - z.max(1, keepdims=True) - log-sum-exp; loss = -np.mean(np.diag(log_probs)).',
      'Without normalization the logits aren\'t cosines and rescaling changes the loss; without the max subtraction a small temperature overflows. Return Python floats.',
    ],
    solution: `import numpy as np

def _l2_normalize(x, eps=1e-12):
    return x / np.maximum(np.linalg.norm(x, axis=1, keepdims=True), eps)


def _cross_entropy_diag(logits):
    """Mean CE where the correct class of row i is column i."""
    z = logits - logits.max(axis=1, keepdims=True)              # stable log-sum-exp
    log_probs = z - np.log(np.exp(z).sum(axis=1, keepdims=True))
    return float(-np.mean(np.diag(log_probs)))


def clip_loss(img_emb, txt_emb, temperature=0.07):
    """
    Returns:
        dict with 'logits' (N, N), 'loss_i2t', 'loss_t2i', 'loss'
    """
    img = _l2_normalize(np.asarray(img_emb, dtype=float))
    txt = _l2_normalize(np.asarray(txt_emb, dtype=float))

    logits = img @ txt.T / temperature        # (N, N) cosine / tau

    loss_i2t = _cross_entropy_diag(logits)    # rows: image -> texts
    loss_t2i = _cross_entropy_diag(logits.T)  # columns: text -> images

    return {
        'logits': logits,
        'loss_i2t': loss_i2t,
        'loss_t2i': loss_t2i,
        'loss': (loss_i2t + loss_t2i) / 2,
    }

# O(N^2 * D) for the similarity matrix
`,
  },
  {
    id: 'embedding-search',
    title: 'Cosine Top-k Embedding Search',
    section: 'representation-learning',
    difficulty: 'easy',
    description: `
## Dense Retrieval with Cosine Similarity

### What you'll build
Exact top-k nearest-neighbour search by cosine similarity: for each query embedding, return the \`k\` most similar documents and their scores.

### Background
This is the "retrieve" step of a RAG system and of every semantic search engine. Embeddings come from a model trained with a contrastive loss (previous problem). With L2-normalized vectors, cosine similarity is a plain dot product, so scoring all documents for a batch of queries is one matrix multiply. Vector databases use approximate indexes (HNSW graphs, IVF clustering, product quantization) to avoid scoring every document; this brute-force version is what they approximate, and what their recall is measured against.

### Algorithm
\`\`\`text
q_n    = queries / max(||queries||, 1e-12)     # (Q, D), per row
d_n    = docs / max(||docs||, 1e-12)           # (N, D), per row
scores = q_n @ d_n.T                           # (Q, N) cosine similarities
\`\`\`
For each query row, sort the documents by score **descending** and keep the first \`k\`.

### Inputs
- \`queries\`: float array \`(Q, D)\`
- \`docs\`: float array \`(N, D)\`
- \`k\`: int, \`1 <= k <= N\`

### Expected Return Format
A tuple \`(indices, scores)\`:
- \`indices\`: \`(Q, k)\` integer array of document indices, best first
- \`scores\`: \`(Q, k)\` array of the matching cosine similarities, non-increasing along each row

### Edge cases and conventions
- **Ties**: equal scores keep the **lower document index first**. A stable sort of the negated scores does this; \`np.argpartition\` and \`torch.topk\` don't guarantee it.
- Documents pointing the same way score the same regardless of their length (that's the point of cosine).

### Constraints
NumPy only, vectorised over queries and documents.

### Follow-up
- Use \`np.argpartition\` to get the top-k in \`O(N)\` per query, then sort only those \`k\`. How do you keep the tie rule?
- When is maximum inner product (no normalization) the right similarity instead of cosine?
`,
    examples: [
      {
        input: 'cosine_topk(np.array([[1.0, 0.0]]), np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [-1.0, 0.0]]), k=2)',
        output: '(indices = [[0, 2]], scores = [[1.0, 0.7071]])',
        explanation: 'Doc 0 points the same way as the query; doc 2 is at 45 degrees; doc 3 is opposite (-1).',
      },
      {
        input: 'cosine_topk(np.array([[1.0, 0.0]]), np.array([[0.0, 3.0], [2.0, 0.0], [1.0, 1.0], [1.0, 0.0], [5.0, 0.0]]), k=4)[0]',
        output: '[[1, 3, 4, 2]]',
        explanation: 'Docs 1, 3 and 4 all have cosine 1 and stay in index order; doc 2 (0.7071) comes next.',
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
      'Cosine similarity of unit vectors is a dot product, so all query-document scores come from one matrix multiply.',
      'Normalize both matrices row-wise, compute the (Q, N) score matrix, sort each row in descending order, keep k columns.',
      'np.argsort(-scores, axis=1, kind="stable")[:, :k] gives the indices; np.take_along_axis(scores, idx, axis=1) gives the matching scores.',
      'np.argsort(scores)[:, ::-1] also sorts descending but reverses the order of ties (higher index first). Clamp norms at 1e-12 so zero vectors don\'t divide by zero.',
    ],
    solution: `import numpy as np

def _l2_normalize(x, eps=1e-12):
    return x / np.maximum(np.linalg.norm(x, axis=1, keepdims=True), eps)


def cosine_topk(queries, docs, k):
    """
    Returns:
        (indices (Q, k), scores (Q, k)), best first
    """
    q = _l2_normalize(np.asarray(queries, dtype=float))
    d = _l2_normalize(np.asarray(docs, dtype=float))
    scores = q @ d.T                                        # (Q, N) cosine similarities

    # Stable sort of -scores: descending, ties keep the lower index first
    order = np.argsort(-scores, axis=1, kind='stable')[:, :k]
    top_scores = np.take_along_axis(scores, order, axis=1)
    return order, top_scores

# O(Q * N * D) to score + O(Q * N log N) to sort
`,
  },
  {
    id: 'retrieve-and-rerank',
    title: 'RAG Retrieval: BM25 + Embedding Rerank',
    section: 'representation-learning',
    difficulty: 'medium',
    description: `
## Hybrid Retrieval for RAG: BM25 + Embedding Rerank

### What you'll build
A two-stage retriever: score every document with BM25, take the top-\`n\` as candidates, then rerank them with a weighted fusion of normalized BM25 and embedding cosine similarity.

### Background
A retrieval-augmented generation (RAG) system answers a question by pasting a few retrieved passages into the LLM's prompt, so the answer can only be as good as the retrieval. Lexical search (BM25) finds rare exact terms that embeddings blur (names, error codes, IDs); dense search finds paraphrases that share no words. Production systems combine them: a cheap first stage over the whole corpus, then a more expensive or more semantic second stage over a few candidates (here a score fusion; often a cross-encoder).

### Stage 1: BM25 (Robertson & Zaragoza)
For a query \`q\` and a document \`d\` (both token lists):
\`\`\`text
score(q, d) = sum over unique terms t of q:
              IDF(t) * f(t, d) * (k1 + 1) / ( f(t, d) + k1 * (1 - b + b * |d| / avgdl) )

IDF(t) = ln( (N - n_t + 0.5) / (n_t + 0.5) + 1 )
\`\`\`
- \`f(t, d)\`: count of \`t\` in \`d\`; \`|d|\`: number of tokens in \`d\`; \`avgdl\`: mean document length
- \`N\`: number of documents; \`n_t\`: number of documents containing \`t\`
- \`k1\` (default 1.5) saturates repeated terms; \`b\` (default 0.75) normalizes for length
- The \`+ 1\` inside the log (Lucene's variant) keeps IDF positive even for very common terms

### Stage 2: candidates
The top-\`n\` documents by BM25, descending; ties go to the lower document index.

### Stage 3: rerank by weighted score fusion
For each candidate \`c\`, with \`cos_c\` the cosine similarity between \`query_emb\` and \`doc_embs[c]\` (denominator \`||q|| · ||d|| + 1e-12\`):
\`\`\`text
bm25_norm_c = bm25_c / max over candidates of bm25     (all 0 if that max is 0)
fused_c     = alpha * bm25_norm_c + (1 - alpha) * cos_c
\`\`\`
Sort the candidates by \`fused\`, descending; ties keep the BM25 candidate order. Dividing by the max puts BM25 on a \`[0, 1]\` scale comparable with cosine.

### Inputs
- \`query_tokens\`: list of str; \`docs_tokens\`: list of \`N\` lists of str (no stemming: \`'cats' != 'cat'\`)
- \`query_emb\`: \`(D,)\`; \`doc_embs\`: \`(N, D)\`
- \`n\`: number of candidates (default 3); \`alpha\` in \`[0, 1]\` (default 0.5); \`k1\`, \`b\` as above

### Expected Return Format
- \`bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75)\`: \`(N,)\` float array
- \`retrieve_and_rerank(...)\`: a dictionary with
  - \`'bm25'\`: \`(N,)\` BM25 scores of every document
  - \`'candidates'\`: \`(n,)\` integer array, top-\`n\` document indices by BM25
  - \`'reranked'\`: \`(n,)\` the same documents in fused order
  - \`'fused'\`: \`(n,)\` fused scores, aligned with \`'reranked'\`

### Edge cases and conventions
- Each distinct query term counts once (repeating a word in the query doesn't double its weight).
- \`alpha = 1\` keeps the BM25 order; \`alpha = 0\` sorts the candidates by cosine alone.

### Constraints
NumPy and plain Python; no retrieval libraries.

### Follow-up
- Reciprocal rank fusion scores \`sum over rankers of 1 / (60 + rank)\` and ignores raw scores. When is it more robust than weighted fusion?
- How would you measure the retriever on its own (recall@k, MRR) before blaming the LLM for a wrong answer?
`,
    examples: [
      {
        input: "query = ['cat', 'pet'], docs = ['the cat sat on the mat', 'dogs and cats are pets', 'the cat chased the mouse', 'stock markets fell sharply today', 'a cat is a small pet'] (split on spaces)",
        output: 'bm25 = [0.5133, 0.0, 0.5576, 0.0, 1.8336], candidates = [4, 2, 0]',
        explanation: "Doc 4 contains both terms. Doc 1 ('cats', 'pets') scores 0: BM25 matches exact tokens only.",
      },
      {
        input: 'same query and docs, query_emb = [1.0, 0.5, 0.0], doc_embs rows 0, 2, 4 = [1, 0.5, 0], [0.6, 0.6, 0.4], [0, 0.3, 1]; n=3, alpha=0.5',
        output: 'reranked = [0, 2, 4], fused = [0.64, 0.5811, 0.5643]',
        explanation: "Doc 0's embedding matches the query exactly (cos = 1), so the rerank lifts it above doc 4, whose embedding is far from the query.",
      },
    ],
    starterCode: `import numpy as np

def bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75):
    """
    BM25 score of every document for one query.

    Args:
        query_tokens: list of query tokens (each distinct term counts once)
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
    BM25 top-n, then rerank by alpha * (bm25 / max candidate bm25)
    + (1 - alpha) * cosine(query_emb, doc_emb).

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
      {
        id: '6',
        description: 'A repeated query term counts once',
        input: `(lambda D: bool(np.allclose(bm25_scores(['cat', 'cat', 'pet'], D), bm25_scores(['cat', 'pet'], D))))([s.split() for s in ['a cat', 'a pet store', 'cat and pet', 'nothing here']])`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Two independent pieces: a lexical scorer over the whole corpus, then a small rerank over n candidates. Get the BM25 numbers right first (the first test checks them alone).',
      'BM25: precompute N, the document lengths and avgdl; for each distinct query term, compute its term frequency in every document and its IDF, and add the saturated, length-normalized contribution.',
      'for t in dict.fromkeys(query_tokens): tf = np.array([d.count(t) for d in docs]); n_t = np.count_nonzero(tf); idf = np.log((N - n_t + 0.5) / (n_t + 0.5) + 1). Candidates: np.argsort(-bm25, kind="stable")[:n].',
      'Normalize BM25 by the max over the candidates (guard against a max of 0), compute cosine only for the candidates, and use a stable sort of -fused so ties keep the BM25 order.',
    ],
    solution: `import numpy as np

def bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75):
    """Returns an (N,) array of BM25 scores."""
    N = len(docs_tokens)
    lengths = np.array([len(d) for d in docs_tokens], dtype=float)
    avgdl = lengths.mean()
    scores = np.zeros(N)
    for term in dict.fromkeys(query_tokens):          # unique terms, in order
        tf = np.array([d.count(term) for d in docs_tokens], dtype=float)
        n_t = np.count_nonzero(tf)
        idf = np.log((N - n_t + 0.5) / (n_t + 0.5) + 1.0)
        # Saturating term frequency with length normalization
        scores += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * lengths / avgdl))
    return scores


def retrieve_and_rerank(query_tokens, docs_tokens, query_emb, doc_embs,
                        n=3, alpha=0.5, k1=1.5, b=0.75):
    """Returns a dict with 'bm25', 'candidates', 'reranked', 'fused'."""
    bm25 = bm25_scores(query_tokens, docs_tokens, k1, b)
    candidates = np.argsort(-bm25, kind='stable')[:n]   # ties: lower index first

    # Cosine similarity between the query and each candidate
    q = np.asarray(query_emb, dtype=float)
    D = np.asarray(doc_embs, dtype=float)[candidates]
    cos = D @ q / (np.linalg.norm(D, axis=1) * np.linalg.norm(q) + 1e-12)

    # Put BM25 on a [0, 1] scale before mixing
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

# BM25: O(|q| * total corpus tokens) here (an inverted index makes it sublinear); rerank: O(n * D)
`,
  },
];
