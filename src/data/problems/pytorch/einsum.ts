import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../einsum.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const einsumPyTorch: Record<string, LanguageVariant> = {
  'einsum-basics': {
    note: 'torch.einsum takes the same subscript strings as np.einsum.',
    starterCode: `import torch

def einsum_basics(arr: torch.Tensor) -> dict:
    """
    Perform basic einsum operations.

    Args:
        arr: 2D input tensor

    Returns:
        Dictionary with einsum results
    """
    # Your code here
    pass
`,
    solution: `import torch

def einsum_basics(arr: torch.Tensor) -> dict:
    return {
        'sum_all': torch.einsum('ij->', arr),
        'row_sum': torch.einsum('ij->i', arr),
        'col_sum': torch.einsum('ij->j', arr),
        'transpose': torch.einsum('ij->ji', arr),
        'diagonal': torch.einsum('ii->i', arr) if arr.shape[0] == arr.shape[1] else None,
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
      "'ij->' sums all elements",
      "'ij->i' sums each row",
      "'ij->ji' transposes",
      "'ii->i' extracts the diagonal (square matrices only)",
    ],
  },

  'einsum-matrix-ops': {
    note: 'Use torch.einsum for every entry.',
    starterCode: `import torch

def einsum_matrix_ops(A: torch.Tensor, B: torch.Tensor, v: torch.Tensor) -> dict:
    """
    Perform matrix operations using einsum.

    Args:
        A: Matrix of shape (m, k)
        B: Matrix of shape (k, n)
        v: Vector of shape (k,)

    Returns:
        Dictionary with operation results
    """
    # Your code here
    pass
`,
    solution: `import torch

def einsum_matrix_ops(A: torch.Tensor, B: torch.Tensor, v: torch.Tensor) -> dict:
    return {
        'matmul': torch.einsum('ik,kj->ij', A, B),
        'matvec': torch.einsum('ij,j->i', A, v),
        'outer_product': torch.einsum('i,j->ij', v, v),
        'hadamard': torch.einsum('ij,ij->ij', A, A),  # A * A
        'frobenius': torch.einsum('ij,ij->', A, A),   # (A * A).sum()
        'trace': torch.einsum('ii->', A) if A.shape[0] == A.shape[1] else None,
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
      "'ik,kj->ij' contracts over k (matrix multiply)",
      "'ij,j->i' contracts the vector with the columns",
      "'i,j->ij' creates an outer product (no contraction)",
    ],
  },

  'einsum-batch-ops': {
    note: 'Use torch.einsum for the two batched products; F.softmax(x, dim=-1) is fine for the softmax.',
    starterCode: `import torch
import torch.nn.functional as F

def einsum_batch_ops(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor) -> dict:
    """
    Perform batch operations using einsum.

    Args:
        Q: Queries of shape (batch, seq_q, dim)
        K: Keys of shape (batch, seq_k, dim)
        V: Values of shape (batch, seq_k, dim_v)

    Returns:
        Dictionary with batch operation results
    """
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def einsum_batch_ops(Q: torch.Tensor, K: torch.Tensor, V: torch.Tensor) -> dict:
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
      "'bqd,bkd->bqk' computes Q @ K.T for each batch",
      "'bqk,bkv->bqv' applies the attention weights to the values",
      'b is the batch dimension, preserved in the output',
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
    Multi-head attention using einsum.

    Args:
        Q: Queries (batch, seq_q, d_model)
        K: Keys (batch, seq_k, d_model)
        V: Values (batch, seq_k, d_model)
        num_heads: Number of attention heads

    Returns:
        output: (batch, seq_q, d_model)
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

    # Split heads: (batch, seq, num_heads, d_k)
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
      'Reshape Q, K, V to (batch, seq, num_heads, d_k)',
      "Use 'bqhd,bkhd->bhqk' for the attention scores per head",
      "Use 'bhqk,bkhd->bqhd' for the weighted values",
      'Reshape back to (batch, seq, d_model)',
    ],
  },

  'einsum-vs-matmul': {
    note: "Keep the key name 'numpy' from the description; its values are the equivalent plain torch operations (torch.sum, A @ B, A.T, ...).",
    starterCode: `import torch

def einsum_equivalence(A: torch.Tensor, B: torch.Tensor) -> dict:
    """
    Compare einsum with traditional tensor operations.

    Args:
        A: First matrix (m, k)
        B: Second matrix (k, n)

    Returns:
        Dictionary with 'einsum' and 'numpy' (plain torch op) results for comparison
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
      'Use torch.allclose() to compare floating point tensors',
      "Remember 'ik,kj->ij' is matrix multiplication",
    ],
  },
};
