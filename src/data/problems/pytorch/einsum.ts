import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../einsum.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const einsumPyTorch: Record<string, LanguageVariant> = {
  'einsum-basics': {
    note: 'torch.einsum takes the same subscript strings as np.einsum. Compute every value with torch.einsum.',
    starterCode: `import torch

def einsum_basics(arr: torch.Tensor) -> dict:
    """
    Single-matrix operations with torch.einsum.

    Args:
        arr: 2D tensor of shape (m, n)

    Returns:
        dict with keys:
            'sum_all':   sum of all elements (0-d tensor)
            'row_sum':   row sums, shape (m,)
            'col_sum':   column sums, shape (n,)
            'transpose': arr transposed, shape (n, m)
            'diagonal':  diagonal, shape (m,), if arr is square, else None
    """
    # Your code here
    pass
`,
    solution: `import torch

def einsum_basics(arr: torch.Tensor) -> dict:
    """
    Returns:
        dict with 'sum_all', 'row_sum', 'col_sum', 'transpose' and
        'diagonal' (None when arr is not square).
    """
    is_square = arr.shape[0] == arr.shape[1]
    return {
        'sum_all': torch.einsum('ij->', arr),      # no letters kept: sum everything
        'row_sum': torch.einsum('ij->i', arr),     # keep i, sum over j
        'col_sum': torch.einsum('ij->j', arr),     # keep j, sum over i
        'transpose': torch.einsum('ij->ji', arr),  # keep both, swapped
        # A repeated letter walks the diagonal; it needs equal dim sizes
        'diagonal': torch.einsum('ii->i', arr) if is_square else None,
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Sum all elements',
        input: 'einsum_basics(torch.tensor([[1, 2], [3, 4]]))["sum_all"]',
        expected: '10',
        hidden: false,
      },
      {
        id: '2',
        description: 'Transpose',
        input: 'einsum_basics(torch.tensor([[1, 2], [3, 4]]))["transpose"]',
        expected: '[[1, 3], [2, 4]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Row and column sums',
        input: '(lambda r: (r["row_sum"].tolist(), r["col_sum"].tolist()))(einsum_basics(torch.tensor([[1, 2, 3], [4, 5, 6]])))',
        expected: '([6, 15], [5, 7, 9])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Diagonal of a square matrix',
        input: 'einsum_basics(torch.tensor([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))["diagonal"]',
        expected: '[1, 5, 9]',
        hidden: true,
      },
      {
        id: '5',
        description: 'No diagonal for a non-square matrix',
        input: 'einsum_basics(torch.ones(2, 3))["diagonal"] is None',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'For each output, ask: which dims survive? Those letters go after the arrow; the rest are summed away.',
      "Label arr's dims 'ij'. Keep nothing for the total, keep i for row sums, keep j for column sums, and write the kept letters in swapped order for the transpose.",
      "torch.einsum('ij->', arr), 'ij->i', 'ij->j', 'ij->ji', and 'ii->i' for the diagonal.",
      "Pitfall: 'ij->i' keeps i, so it sums over j and gives one value per row. And 'ii->i' raises an error on a non-square tensor: check arr.shape first and return None.",
    ],
  },

  'einsum-matrix-ops': {
    note: 'Use torch.einsum for every entry (not @, torch.outer or torch.trace).',
    starterCode: `import torch

def einsum_matrix_ops(A: torch.Tensor, B: torch.Tensor, v: torch.Tensor) -> dict:
    """
    Two-operand products with torch.einsum.

    Args:
        A: Matrix of shape (m, k)
        B: Matrix of shape (k, n)
        v: Vector of shape (k,)

    Returns:
        dict with keys:
            'matmul':        A @ B, shape (m, n)
            'matvec':        A @ v, shape (m,)
            'outer_product': outer(v, v), shape (k, k)
            'hadamard':      A * A, shape (m, k)
            'frobenius':     (A * A).sum(), 0-d tensor
            'trace':         trace of A if square, else None
    """
    # Your code here
    pass
`,
    solution: `import torch

def einsum_matrix_ops(A: torch.Tensor, B: torch.Tensor, v: torch.Tensor) -> dict:
    """
    Returns:
        dict with 'matmul', 'matvec', 'outer_product', 'hadamard',
        'frobenius' and 'trace' (None when A is not square).
    """
    is_square = A.shape[0] == A.shape[1]
    return {
        'matmul': torch.einsum('ik,kj->ij', A, B),       # k shared and dropped: contracted
        'matvec': torch.einsum('ij,j->i', A, v),
        'outer_product': torch.einsum('i,j->ij', v, v),  # no shared letter: outer product
        'hadamard': torch.einsum('ij,ij->ij', A, A),     # shared and kept: elementwise
        'frobenius': torch.einsum('ij,ij->', A, A),      # elementwise, then sum everything
        'trace': torch.einsum('ii->', A) if is_square else None,
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Matrix multiplication',
        input: 'einsum_matrix_ops(torch.tensor([[1, 2], [3, 4]]), torch.tensor([[5, 6], [7, 8]]), torch.tensor([1, 2]))["matmul"]',
        expected: '[[19, 22], [43, 50]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Outer product',
        input: 'einsum_matrix_ops(torch.tensor([[1, 2], [3, 4]]), torch.tensor([[5, 6], [7, 8]]), torch.tensor([1, 2]))["outer_product"]',
        expected: '[[1, 2], [2, 4]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Matrix-vector product and Hadamard',
        input: '(lambda r: (r["matvec"].tolist(), r["hadamard"].tolist()))(einsum_matrix_ops(torch.tensor([[1, 2], [3, 4]]), torch.tensor([[5, 6], [7, 8]]), torch.tensor([1, 2])))',
        expected: '([5, 11], [[1, 4], [9, 16]])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Frobenius inner product and trace',
        input: '(lambda r: (int(r["frobenius"]), int(r["trace"])))(einsum_matrix_ops(torch.tensor([[1, 2], [3, 4]]), torch.tensor([[5, 6], [7, 8]]), torch.tensor([1, 2])))',
        expected: '(30, 5)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Non-square A: no trace',
        input: '(lambda r: (r["matmul"].tolist(), r["trace"] is None))(einsum_matrix_ops(torch.tensor([[1, 0, 2]]), torch.tensor([[1], [2], [3]]), torch.tensor([1, 1, 1])))',
        expected: '([[7]], True)',
        hidden: true,
      },
    ],
    hints: [
      'Write down the shape of each result. Which letters must appear after the arrow, and which are shared but disappear?',
      'A shared letter missing from the output is multiplied and summed (contracted); a shared letter kept in the output is just multiplied elementwise; operands with no letter in common give an outer product.',
      "'ik,kj->ij' (matmul), 'ij,j->i' (matvec), 'i,j->ij' (outer), 'ij,ij->ij' (Hadamard), 'ij,ij->' (Frobenius) and 'ii->' (trace).",
      "Pitfall: 'ij,ij->ij' keeps both letters, so nothing is summed. torch.einsum also needs all operands to share a dtype: don't mix int and float tensors.",
    ],
  },

  'einsum-batch-ops': {
    note: "Use torch.einsum for the two batched products (not @ or torch.bmm); F.softmax(x, dim=-1) is fine for the softmax. Don't use F.scaled_dot_product_attention.",
    starterCode: `import torch
import torch.nn.functional as F

def einsum_batch_ops(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor) -> dict:
    """
    Batched scaled dot-product attention with torch.einsum.

    Args:
        Q: Queries of shape (batch, seq_q, d)
        K: Keys of shape (batch, seq_k, d)
        V: Values of shape (batch, seq_k, d_v)

    Returns:
        dict with keys:
            'scores':            Q @ K^T per batch (unscaled), shape (batch, seq_q, seq_k)
            'attention_weights': softmax(scores / sqrt(d)) over keys, shape (batch, seq_q, seq_k)
            'output':            weights @ V per batch, shape (batch, seq_q, d_v)
    """
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def einsum_batch_ops(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor) -> dict:
    """
    Returns:
        dict with 'scores' (batch, seq_q, seq_k), 'attention_weights'
        (batch, seq_q, seq_k) and 'output' (batch, seq_q, d_v).
    """
    # Attention scores: Q @ K.T for each batch -> (batch, seq_q, seq_k)
    scores = torch.einsum('bqd,bkd->bqk', Q, K)

    # Scale and normalize over the keys
    d_k = Q.shape[-1]
    attention_weights = F.softmax(scores / math.sqrt(d_k), dim=-1)

    # Weighted sum of values -> (batch, seq_q, dim_v)
    output = torch.einsum('bqk,bkv->bqv', attention_weights, V)

    return {
        'scores': scores,
        'attention_weights': attention_weights,
        'output': output,
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Attention scores shape',
        input: 'tuple(einsum_batch_ops(torch.ones(2, 4, 8), torch.ones(2, 6, 8), torch.ones(2, 6, 16))["scores"].shape)',
        expected: '(2, 4, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Output shape',
        input: 'tuple(einsum_batch_ops(torch.ones(2, 4, 8), torch.ones(2, 6, 8), torch.ones(2, 6, 16))["output"].shape)',
        expected: '(2, 4, 16)',
        hidden: false,
      },
      {
        id: '5',
        description: 'Raw scores of a small example',
        input: 'einsum_batch_ops(torch.tensor([[[1., 0.], [0., 1.]]]), torch.tensor([[[1., 1.], [2., 0.], [0., 3.]]]), torch.tensor([[[1., 0.], [0., 1.], [1., 1.]]]))["scores"]',
        expected: '[[[1.0, 2.0, 0.0], [1.0, 0.0, 3.0]]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Scores equal Q @ K^T',
        input: `(lambda: (
    Q := torch.randn(2, 3, 4),
    K := torch.randn(2, 5, 4),
    V := torch.randn(2, 5, 6),
    bool(torch.allclose(einsum_batch_ops(Q, K, V)["scores"], Q @ K.transpose(1, 2), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Weights and output match scaled softmax attention',
        input: `(lambda: (
    Q := torch.randn(2, 3, 4),
    K := torch.randn(2, 5, 4),
    V := torch.randn(2, 5, 6),
    s := Q @ K.transpose(1, 2) / 2.0,
    w := s.exp() / s.exp().sum(dim=-1, keepdim=True),
    r := einsum_batch_ops(Q, K, V),
    bool(torch.allclose(r["attention_weights"], w, atol=1e-5) and torch.allclose(r["output"], w @ V, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'The batch letter b must appear in every operand and in the output, so each batch element is handled independently.',
      'Three steps: an einsum for the scores (contract the feature dim d), a softmax over the key dim, then an einsum that contracts the key dim k with V.',
      "torch.einsum('bqd,bkd->bqk', Q, K), then F.softmax(scores / math.sqrt(d), dim=-1), then torch.einsum('bqk,bkv->bqv', weights, V).",
      'Pitfall: return the scores before scaling, but scale by 1/sqrt(d) before the softmax. And normalise over the keys (dim=-1), not the queries.',
    ],
  },

  'einsum-advanced': {
    note: 'Use .view/.reshape and torch.einsum; F.softmax(x, dim=-1) is fine. Don\'t use nn.MultiheadAttention or F.scaled_dot_product_attention.',
    starterCode: `import math
import torch
import torch.nn.functional as F

def multi_head_attention_einsum(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor,
                                 num_heads: int) -> torch.Tensor:
    """
    Multi-head scaled dot-product attention using einsum (no projections).

    Args:
        Q: Queries (batch, seq_q, d_model)
        K: Keys (batch, seq_k, d_model)
        V: Values (batch, seq_k, d_model)
        num_heads: Number of heads; divides d_model

    Returns:
        output: (batch, seq_q, d_model); channels h*d_k:(h+1)*d_k come from head h
    """
    batch, seq_q, d_model = Q.shape
    seq_k = K.shape[1]
    d_k = d_model // num_heads

    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def multi_head_attention_einsum(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor,
                                 num_heads: int) -> torch.Tensor:
    batch, seq_q, d_model = Q.shape
    seq_k = K.shape[1]
    d_k = d_model // num_heads

    # Split heads: (batch, seq, num_heads, d_k); head h owns channels h*d_k:(h+1)*d_k
    Q = Q.reshape(batch, seq_q, num_heads, d_k)
    K = K.reshape(batch, seq_k, num_heads, d_k)
    V = V.reshape(batch, seq_k, num_heads, d_k)

    # Scores for all heads: (batch, heads, seq_q, seq_k)
    scores = torch.einsum('bqhd,bkhd->bhqk', Q, K) / math.sqrt(d_k)
    attention = F.softmax(scores, dim=-1)

    # Weighted sum of values: (batch, seq_q, heads, d_k)
    output = torch.einsum('bhqk,bkhd->bqhd', attention, V)

    # Merge heads back: (batch, seq_q, d_model)
    return output.reshape(batch, seq_q, d_model)
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'tuple(multi_head_attention_einsum(torch.ones(2, 4, 64), torch.ones(2, 4, 64), torch.ones(2, 4, 64), 8).shape)',
        expected: '(2, 4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'One head equals single-head attention',
        input: `(lambda: (
    Q := torch.randn(2, 3, 8),
    K := torch.randn(2, 5, 8),
    V := torch.randn(2, 5, 8),
    s := Q @ K.transpose(1, 2) / 8 ** 0.5,
    ref := (s.exp() / s.exp().sum(dim=-1, keepdim=True)) @ V,
    bool(torch.allclose(multi_head_attention_einsum(Q, K, V, 1), ref, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '5',
        description: 'Two heads on a 2-channel example',
        input: '(lambda X: bool(torch.allclose(multi_head_attention_einsum(X, X, X, 2), torch.tensor([[[0.7311, 0.5], [0.5, 0.7311]]]), atol=1e-4)))(torch.tensor([[[1., 0.], [0., 1.]]]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '3',
        description: 'Output is finite',
        input: 'bool(not torch.isnan(multi_head_attention_einsum(torch.ones(2, 4, 64), torch.ones(2, 4, 64), torch.ones(2, 4, 64), 8)).any())',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Each head attends independently (2 heads)',
        input: `(lambda: (
    Q := torch.randn(2, 3, 8),
    K := torch.randn(2, 5, 8),
    V := torch.randn(2, 5, 8),
    out := multi_head_attention_einsum(Q, K, V, 2),
    s := Q[:, :, 4:] @ K[:, :, 4:].transpose(1, 2) / 2.0,
    ref := (s.exp() / s.exp().sum(dim=-1, keepdim=True)) @ V[:, :, 4:],
    bool(torch.allclose(out[:, :, 4:], ref, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Each head is ordinary attention on its own d_k-wide slice of the features. Reshaping exposes that slice as a separate dim.',
      'Reshape Q, K, V to (batch, seq, num_heads, d_k); compute per-head scores; softmax over keys; weight the values; reshape back to (batch, seq_q, d_model).',
      "torch.einsum('bqhd,bkhd->bhqk', Q, K) / math.sqrt(d_k), F.softmax(..., dim=-1), then torch.einsum('bhqk,bkhd->bqhd', A, V). Putting q before h in the output means the final reshape needs no permute.",
      'Pitfall: scale by sqrt(d_k), not sqrt(d_model). If you produce (batch, heads, seq_q, d_k) and reshape it directly to (batch, seq_q, d_model), heads and positions get mixed silently (and .view fails on a permuted tensor).',
    ],
  },

  'einsum-vs-matmul': {
    note: "Keep the key name 'numpy' from the description; its values are the equivalent plain torch operations (torch.sum, A @ B, A.T, ...).",
    starterCode: `import torch

def einsum_equivalence(A: torch.Tensor, B: torch.Tensor) -> dict:
    """
    Compare einsum with traditional tensor operations.

    Args:
        A: First float matrix (m, k)
        B: Second float matrix (k, n)

    Returns:
        dict with keys:
            'results':   {'sum', 'row_sum', 'matmul', 'transpose', 'hadamard_sum'},
                         each mapping to {'einsum': ..., 'numpy': <plain torch op>}
            'all_match': Python bool, True if every pair is torch.allclose
    """
    # Your code here
    pass
`,
    solution: `import torch

def einsum_equivalence(A: torch.Tensor, B: torch.Tensor) -> dict:
    results = {
        'sum': {
            'einsum': torch.einsum('ij->', A),
            'numpy': torch.sum(A),
        },
        'row_sum': {
            'einsum': torch.einsum('ij->i', A),
            'numpy': torch.sum(A, dim=1),
        },
        'matmul': {
            'einsum': torch.einsum('ik,kj->ij', A, B),
            'numpy': A @ B,
        },
        'transpose': {
            'einsum': torch.einsum('ij->ji', A),
            'numpy': A.T,
        },
        'hadamard_sum': {
            'einsum': torch.einsum('ij,ij->', A, A),
            'numpy': torch.sum(A * A),
        },
    }

    # Verify all match
    all_match = all(
        torch.allclose(v['einsum'], v['numpy'])
        for v in results.values()
    )

    return {'results': results, 'all_match': all_match}
`,
    testCases: [
      {
        id: '1',
        description: 'All results match',
        input: 'bool(einsum_equivalence(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]))["all_match"])',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Matrix multiplication matches',
        input: 'einsum_equivalence(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), torch.tensor([[5.0, 6.0], [7.0, 8.0]]))["results"]["matmul"]["einsum"]',
        expected: '[[19.0, 22.0], [43.0, 50.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'All five operations present',
        input: 'sorted(einsum_equivalence(torch.ones(2, 3), torch.ones(3, 2))["results"].keys())',
        expected: '["hadamard_sum", "matmul", "row_sum", "sum", "transpose"]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Hadamard sum and row sums',
        input: '(lambda r: (float(r["hadamard_sum"]["einsum"]), r["row_sum"]["numpy"].tolist()))(einsum_equivalence(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]))["results"])',
        expected: '(91.0, [6.0, 15.0])',
        hidden: true,
      },
    ],
    hints: [
      'Build one small dict per operation holding both versions, then check them all at the end.',
      "Use the table in the description: the einsum string on one side, the familiar op on the other (torch.sum, torch.sum(A, dim=1), A @ B, A.T, torch.sum(A * A)). 'hadamard_sum' uses A twice.",
      "all_match = all(torch.allclose(r['einsum'], r['numpy']) for r in results.values()) gives a Python bool.",
      "Pitfall: keep the key name 'numpy' even though the values are torch tensors, and compare with torch.allclose rather than ==.",
    ],
  },
};
