// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/representation-learning.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const representationLearningPyTorchPending: Record<string, unknown> = {
  'infonce-loss': {
    note: 'F.normalize and F.cross_entropy are allowed: the point is the similarity matrix, the diagonal labels and the symmetric average. Return Python floats for the losses.',
    starterCode: `import torch
import torch.nn.functional as F

def clip_loss(img_emb: torch.Tensor, txt_emb: torch.Tensor, temperature: float = 0.07) -> dict:
    """
    Symmetric InfoNCE loss used by CLIP.

    Args:
        img_emb: (N, D) image embeddings (row i pairs with txt_emb row i)
        txt_emb: (N, D) text embeddings
        temperature: softmax temperature τ

    Returns:
        dict with 'logits' (N, N) tensor, 'loss_i2t', 'loss_t2i', 'loss' (Python floats)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def clip_loss(img_emb: torch.Tensor, txt_emb: torch.Tensor, temperature: float = 0.07) -> dict:
    img = F.normalize(img_emb.double(), dim=-1)
    txt = F.normalize(txt_emb.double(), dim=-1)

    logits = img @ txt.T / temperature                  # (N, N)
    labels = torch.arange(logits.shape[0])              # matches on the diagonal

    loss_i2t = F.cross_entropy(logits, labels)          # image -> texts
    loss_t2i = F.cross_entropy(logits.T, labels)        # text -> images
    loss = (loss_i2t + loss_t2i) / 2

    return {
        'logits': logits,
        'loss_i2t': loss_i2t.item(),
        'loss_t2i': loss_t2i.item(),
        'loss': loss.item(),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Perfectly aligned pairs, temperature 1',
        input: "round(clip_loss(torch.eye(2), torch.eye(2), 1.0)['loss'], 4)",
        expected: '0.3133',
        hidden: false,
      },
      {
        id: '2',
        description: 'Logits shape and range (|cos| / τ <= 1 / τ)',
        input: `(lambda r: (tuple(r['logits'].shape), bool((r['logits'].abs() <= 1 / 0.1 + 1e-6).all())))(clip_loss(torch.randn(4, 8), torch.randn(4, 8), 0.1))`,
        expected: '((4, 4), True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Asymmetric batch: both directions and the mean (values)',
        input: `(lambda r: (round(r['loss_i2t'], 4), round(r['loss_t2i'], 4), round(r['loss'], 4)))(clip_loss(
    torch.tensor([[1.0, 0.0], [0.6, 0.8], [0.0, 1.0]]),
    torch.tensor([[0.8, 0.6], [0.0, 1.0], [1.0, 1.0]]), 0.5))`,
        expected: '(1.1121, 1.1433, 1.1277)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Embeddings are L2-normalised: rescaling the rows changes nothing',
        input: `(lambda: (
    a := torch.randn(5, 6), b := torch.randn(5, 6),
    s := torch.tensor([[0.5], [2.0], [3.0], [0.1], [7.0]]),
    bool(abs(clip_loss(a * s, b * s.flip(0), 0.2)['loss'] - clip_loss(a, b, 0.2)['loss']) < 1e-5)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Matches a hand-written log-softmax reference on random inputs',
        input: `(lambda: (
    a := torch.randn(6, 4), b := torch.randn(6, 4),
    an := a.double() / a.double().norm(dim=1, keepdim=True), bn := b.double() / b.double().norm(dim=1, keepdim=True),
    L := an @ bn.T / 0.3,
    ref := -(torch.log_softmax(L, dim=1).diag().mean() + torch.log_softmax(L, dim=0).diag().mean()) / 2,
    bool(abs(clip_loss(a, b, 0.3)['loss'] - ref.item()) < 1e-6)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'F.normalize(x, dim=-1) L2-normalises each row',
      'logits = img @ txt.T / temperature; labels = torch.arange(N)',
      'loss = (F.cross_entropy(logits, labels) + F.cross_entropy(logits.T, labels)) / 2',
    ],
  },
  'embedding-search': {
    note: "Don't use torch.topk: it doesn't guarantee the order of tied scores. Use torch.sort(..., descending=True, stable=True).",
    starterCode: `import torch
import torch.nn.functional as F

def cosine_topk(queries: torch.Tensor, docs: torch.Tensor, k: int):
    """
    Exact top-k retrieval by cosine similarity.

    Args:
        queries: (Q, D) query embeddings
        docs: (N, D) document embeddings
        k: number of results per query

    Returns:
        (indices (Q, k) long tensor, scores (Q, k) tensor), sorted by score
        descending, ties broken by lower document index
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def cosine_topk(queries: torch.Tensor, docs: torch.Tensor, k: int):
    q = F.normalize(queries.double(), dim=-1)
    d = F.normalize(docs.double(), dim=-1)
    scores = q @ d.T                                          # (Q, N)

    # Stable descending sort keeps equal scores in index order
    sorted_scores, order = torch.sort(scores, dim=1, descending=True, stable=True)
    return order[:, :k], sorted_scores[:, :k]
`,
    testCases: [
      {
        id: '1',
        description: 'Top-2 indices for a single query',
        input: 'cosine_topk(torch.tensor([[1.0, 0.0]]), torch.tensor([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [-1.0, 0.0]]), 2)[0].tolist()',
        expected: '[[0, 2]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Top-2 scores for a single query',
        input: '(lambda r: [[round(v, 4) for v in row] for row in r[1].tolist()])(cosine_topk(torch.tensor([[1.0, 0.0]]), torch.tensor([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0], [-1.0, 0.0]]), 2))',
        expected: '[[1.0, 0.7071]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Ties are broken by the lower document index',
        input: 'cosine_topk(torch.tensor([[1.0, 0.0]]), torch.tensor([[0.0, 3.0], [2.0, 0.0], [1.0, 1.0], [1.0, 0.0], [5.0, 0.0]]), 4)[0].tolist()',
        expected: '[[1, 3, 4, 2]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Batch of queries: indices and scores (values)',
        input: `(lambda r: (r[0].tolist(), [[round(v, 4) for v in row] for row in r[1].tolist()]))(cosine_topk(
    torch.tensor([[1.0, 2.0, 0.0], [0.0, -1.0, 2.0]]),
    torch.tensor([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0], [1.0, 1.0, 1.0], [2.0, 4.0, 0.5]]), 3))`,
        expected: '([[4, 1, 3], [2, 3, 0]], [[0.9938, 0.8944, 0.7746], [0.8944, 0.2582, 0.0]])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Random corpus: scores are sorted and match the returned documents',
        input: `(lambda: (
    Q := torch.randn(3, 16), Dm := torch.randn(50, 16),
    r := cosine_topk(Q, Dm, 5),
    cos := torch.nn.functional.cosine_similarity(Q.double().unsqueeze(1), Dm.double().unsqueeze(0), dim=-1),
    bool((r[1][:, 1:] <= r[1][:, :-1]).all()) and bool(torch.allclose(cos.gather(1, r[0]), r[1].double(), atol=1e-6))
    and bool(torch.allclose(r[1][:, 0].double(), cos.max(dim=1).values, atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'F.normalize both matrices along dim=-1, then scores = q @ d.T',
      'torch.sort(scores, dim=1, descending=True, stable=True) returns (values, indices)',
      'Slice the first k columns of both',
    ],
  },
  'retrieve-and-rerank': {
    note: 'Tokens are plain Python lists, so the counting is ordinary Python; keep the scores in tensors (torch.log, torch.sort with stable=True, F.cosine_similarity or a manual dot product).',
    starterCode: `import torch
import torch.nn.functional as F

def bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75) -> torch.Tensor:
    """
    BM25 score of every document for one query.

    Args:
        query_tokens: list of query tokens
        docs_tokens: list of N token lists
        k1, b: BM25 parameters

    Returns:
        (N,) tensor of scores
    """
    # Your code here
    pass


def retrieve_and_rerank(query_tokens, docs_tokens, query_emb, doc_embs,
                        n=3, alpha=0.5, k1=1.5, b=0.75) -> dict:
    """
    BM25 top-n, then rerank by alpha * normalised BM25 + (1 - alpha) * cosine.

    Args:
        query_emb: (D,) query embedding tensor
        doc_embs: (N, D) document embedding tensor

    Returns:
        dict with 'bm25' (N,), 'candidates' (n,), 'reranked' (n,), 'fused' (n,) tensors
    """
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def bm25_scores(query_tokens, docs_tokens, k1=1.5, b=0.75) -> torch.Tensor:
    N = len(docs_tokens)
    lengths = torch.tensor([len(d) for d in docs_tokens], dtype=torch.float64)
    avgdl = lengths.mean()
    scores = torch.zeros(N, dtype=torch.float64)
    for term in dict.fromkeys(query_tokens):          # unique terms, in order
        tf = torch.tensor([d.count(term) for d in docs_tokens], dtype=torch.float64)
        n_t = int((tf > 0).sum().item())
        idf = math.log((N - n_t + 0.5) / (n_t + 0.5) + 1.0)
        scores = scores + idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * lengths / avgdl))
    return scores


def retrieve_and_rerank(query_tokens, docs_tokens, query_emb, doc_embs,
                        n=3, alpha=0.5, k1=1.5, b=0.75) -> dict:
    bm25 = bm25_scores(query_tokens, docs_tokens, k1, b)
    candidates = torch.sort(bm25, descending=True, stable=True)[1][:n]

    D = doc_embs.double()[candidates]
    q = query_emb.double()
    cos = F.cosine_similarity(D, q.unsqueeze(0), dim=-1)

    cand_bm25 = bm25[candidates]
    top = cand_bm25.max()
    bm25_norm = cand_bm25 / top if top > 0 else torch.zeros_like(cand_bm25)
    fused = alpha * bm25_norm + (1 - alpha) * cos

    order = torch.sort(fused, descending=True, stable=True)[1]   # ties keep BM25 order
    return {
        'bm25': bm25,
        'candidates': candidates,
        'reranked': candidates[order],
        'fused': fused[order],
    }
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
    torch.tensor([1.0, 0.5, 0.0]),
    torch.tensor([[1.0, 0.5, 0.0], [0.9, 0.6, 0.0], [0.6, 0.6, 0.4], [0.0, 0.1, 1.0], [0.0, 0.3, 1.0]]), n=3, alpha=0.5))`,
        expected: '([4, 2, 0], [0, 2, 4])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Fused scores (values)',
        input: `(lambda r: [round(float(s), 4) for s in r['fused']])(retrieve_and_rerank(['cat', 'pet'], [s.split() for s in [
    'the cat sat on the mat', 'dogs and cats are pets', 'the cat chased the mouse',
    'stock markets fell sharply today', 'a cat is a small pet']],
    torch.tensor([1.0, 0.5, 0.0]),
    torch.tensor([[1.0, 0.5, 0.0], [0.9, 0.6, 0.0], [0.6, 0.6, 0.4], [0.0, 0.1, 1.0], [0.0, 0.3, 1.0]]), n=3, alpha=0.5))`,
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
    retrieve_and_rerank(['cat'], docs, torch.tensor([0.0, 1.0]), E, n=3, alpha=1.0)['reranked'].tolist(),
    retrieve_and_rerank(['cat'], docs, torch.tensor([0.0, 1.0]), E, n=3, alpha=0.0)['reranked'].tolist(),
))([s.split() for s in ['cat cat dog', 'cat', 'dog bird', 'a cat b c']],
   torch.tensor([[1.0, 0.0], [1.0, 0.0], [0.0, 1.0], [0.0, 1.0]]))`,
        expected: '([1, 0, 3], [3, 1, 0])',
        hidden: true,
      },
    ],
    hints: [
      'Build tf with torch.tensor([d.count(t) for d in docs], dtype=torch.float64) for each unique query term',
      'idf = math.log((N - n_t + 0.5) / (n_t + 0.5) + 1); n_t = number of documents with tf > 0',
      'torch.sort(bm25, descending=True, stable=True)[1][:n] gives the candidates',
      'F.cosine_similarity(doc_embs[candidates], query_emb.unsqueeze(0), dim=-1) for the semantic score',
    ],
  },
};
