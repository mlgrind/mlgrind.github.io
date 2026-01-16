import { Problem } from '../../types';

export const einsumProblems: Problem[] = [
  {
    id: 'einsum-basics',
    title: 'Einsum Fundamentals',
    section: 'einsum',
    difficulty: 'easy',
    description: `
## Einsum Fundamentals

Einstein summation notation provides a powerful way to express array operations.

### Syntax
\`\`\`python
np.einsum('subscripts', operands)
\`\`\`

### Basic Operations
- \`'i->'\`: Sum all elements (reduce)
- \`'ij->i'\`: Sum along columns (row sums)
- \`'ij->j'\`: Sum along rows (column sums)
- \`'ii->i'\`: Extract diagonal
- \`'ij->ji'\`: Transpose

### Task
Implement basic einsum operations on a 2D array.

### Expected Return Format
Return a dictionary with these keys:
- \`'sum_all'\`: Sum of all elements
- \`'row_sum'\`: Sum along each row
- \`'col_sum'\`: Sum along each column
- \`'transpose'\`: Transposed array
- \`'diagonal'\`: Diagonal elements (for square matrices, else None)
    `,
    examples: [
      {
        input: 'np.array([[1,2],[3,4]])',
        output: "{'sum_all': 10, 'row_sum': [3,7], 'col_sum': [4,6], 'transpose': [[1,3],[2,4]], 'diagonal': [1,4]}",
        explanation: 'Basic einsum operations on a 2x2 matrix',
      },
    ],
    starterCode: `import numpy as np

def einsum_basics(arr: np.ndarray) -> dict:
    """
    Perform basic einsum operations.

    Args:
        arr: 2D input array

    Returns:
        Dictionary with einsum results
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Sum all elements',
        input: 'einsum_basics(np.array([[1, 2], [3, 4]]))["sum_all"]',
        expected: '10',
        hidden: false,
      },
      {
        id: '2',
        description: 'Transpose',
        input: 'bool(np.array_equal(einsum_basics(np.array([[1, 2], [3, 4]]))["transpose"], np.array([[1, 3], [2, 4]])))',
        expected: 'True',
        hidden: false,
      },
    ],
    hints: [
      "'ij->' sums all elements",
      "'ij->i' sums each row",
      "'ij->ji' transposes",
      "'ii->i' extracts diagonal (for square matrices)",
    ],
    solution: `import numpy as np

def einsum_basics(arr: np.ndarray) -> dict:
    return {
        'sum_all': np.einsum('ij->', arr),
        'row_sum': np.einsum('ij->i', arr),
        'col_sum': np.einsum('ij->j', arr),
        'transpose': np.einsum('ij->ji', arr),
        'diagonal': np.einsum('ii->i', arr) if arr.shape[0] == arr.shape[1] else None
    }
`,
  },
  {
    id: 'einsum-matrix-ops',
    title: 'Matrix Operations with Einsum',
    section: 'einsum',
    difficulty: 'medium',
    description: `
## Matrix Operations with Einsum

Einsum can express matrix multiplication and more complex operations.

### Key Operations
- \`'ik,kj->ij'\`: Matrix multiplication (A @ B)
- \`'ij,ij->ij'\`: Element-wise multiplication (Hadamard)
- \`'ij,ij->'\`: Frobenius inner product (sum of element-wise product)
- \`'ij,j->i'\`: Matrix-vector multiplication
- \`'i,j->ij'\`: Outer product

### Task
Implement matrix operations using einsum.

### Expected Return Format
Return a dictionary with these keys:
- \`'matmul'\`: Matrix multiplication A @ B
- \`'matvec'\`: Matrix-vector multiplication A @ v
- \`'outer_product'\`: Outer product of v with itself
- \`'hadamard'\`: Element-wise A * A
- \`'frobenius'\`: Sum of A * A (Frobenius inner product)
- \`'trace'\`: Trace of A (if square, else None)
    `,
    examples: [
      {
        input: 'A=[[1,2],[3,4]], B=[[5,6],[7,8]], v=[1,2]',
        output: "{'matmul': [[19,22],[43,50]], 'matvec': [5,11], 'outer_product': [[1,2],[2,4]], 'hadamard': [[1,4],[9,16]], 'frobenius': 30, 'trace': 5}",
        explanation: 'Matrix operations via einsum',
      },
    ],
    starterCode: `import numpy as np

def einsum_matrix_ops(A: np.ndarray, B: np.ndarray, v: np.ndarray) -> dict:
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
    testCases: [
      {
        id: '1',
        description: 'Matrix multiplication',
        input: 'bool(np.array_equal(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["matmul"], np.array([[19,22],[43,50]])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Outer product',
        input: 'bool(np.array_equal(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["outer_product"], np.array([[1,2],[2,4]])))',
        expected: 'True',
        hidden: false,
      },
    ],
    hints: [
      "'ik,kj->ij' contracts over k (matrix multiply)",
      "'ij,j->i' contracts vector with columns",
      "'i,j->ij' creates outer product (no contraction)",
    ],
    solution: `import numpy as np

def einsum_matrix_ops(A: np.ndarray, B: np.ndarray, v: np.ndarray) -> dict:
    return {
        'matmul': np.einsum('ik,kj->ij', A, B),
        'matvec': np.einsum('ij,j->i', A, v),
        'outer_product': np.einsum('i,j->ij', v, v),
        'hadamard': np.einsum('ij,ij->ij', A, A),  # A * A
        'frobenius': np.einsum('ij,ij->', A, A),   # sum(A * A)
        'trace': np.einsum('ii->', A) if A.shape[0] == A.shape[1] else None
    }
`,
  },
  {
    id: 'einsum-batch-ops',
    title: 'Batch Operations with Einsum',
    section: 'einsum',
    difficulty: 'medium',
    description: `
## Batch Operations with Einsum

Einsum shines for batch operations - multiple matrices at once.

### Batch Matrix Operations
- \`'bij,bjk->bik'\`: Batch matrix multiplication
- \`'bij,bj->bi'\`: Batch matrix-vector multiplication
- \`'bij->bji'\`: Batch transpose

### Attention-style Operations
- \`'bqd,bkd->bqk'\`: Query-Key dot products (attention scores)
- \`'bqk,bkv->bqv'\`: Weighted sum of values

### Task
Implement batch operations common in deep learning.

### Expected Return Format
Return a dictionary with these keys:
- \`'scores'\`: Raw attention scores Q @ K.T per batch, shape (batch, seq_q, seq_k)
- \`'attention_weights'\`: Softmax of scaled scores, shape (batch, seq_q, seq_k)
- \`'output'\`: Weighted sum of values, shape (batch, seq_q, dim_v)
    `,
    examples: [
      {
        input: 'Q (2,4,8), K (2,6,8), V (2,6,16)',
        output: "{'scores': shape (2,4,6), 'attention_weights': shape (2,4,6), 'output': shape (2,4,16)}",
        explanation: 'Batch attention: scores from Q@K.T, then weighted sum of V',
      },
    ],
    starterCode: `import numpy as np

def einsum_batch_ops(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> dict:
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
    testCases: [
      {
        id: '1',
        description: 'Attention scores shape',
        input: 'einsum_batch_ops(np.ones((2, 4, 8)), np.ones((2, 6, 8)), np.ones((2, 6, 16)))["scores"].shape',
        expected: '(2, 4, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Output shape',
        input: 'einsum_batch_ops(np.ones((2, 4, 8)), np.ones((2, 6, 8)), np.ones((2, 6, 16)))["output"].shape',
        expected: '(2, 4, 16)',
        hidden: false,
      },
    ],
    hints: [
      "'bqd,bkd->bqk' computes Q @ K.T for each batch",
      "'bqk,bkv->bqv' applies attention weights to values",
      "b is the batch dimension, preserved in output",
    ],
    solution: `import numpy as np

def einsum_batch_ops(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> dict:
    # Q: (batch, seq_q, dim)
    # K: (batch, seq_k, dim)
    # V: (batch, seq_k, dim_v)

    # Attention scores: Q @ K.T for each batch
    # Result: (batch, seq_q, seq_k)
    scores = np.einsum('bqd,bkd->bqk', Q, K)

    # Scale scores
    d_k = Q.shape[-1]
    scaled_scores = scores / np.sqrt(d_k)

    # Softmax (simplified, along last axis)
    exp_scores = np.exp(scaled_scores - scaled_scores.max(axis=-1, keepdims=True))
    attention_weights = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

    # Weighted sum of values
    # Result: (batch, seq_q, dim_v)
    output = np.einsum('bqk,bkv->bqv', attention_weights, V)

    return {
        'scores': scores,
        'attention_weights': attention_weights,
        'output': output
    }
`,
  },
  {
    id: 'einsum-advanced',
    title: 'Advanced Einsum Patterns',
    section: 'einsum',
    difficulty: 'hard',
    description: `
## Advanced Einsum Patterns

Complex tensor operations for deep learning.

### Multi-Head Attention Pattern
\`\`\`python
# Split heads: (batch, seq, heads, dim)
# Attention per head: 'bhqd,bhkd->bhqk'
# Combine heads: 'bhqv->bqhv' then reshape
\`\`\`

### Bilinear Operations
\`\`\`python
# x.T @ W @ y: 'i,ijk,k->j'
# Batch bilinear: 'bi,ijk,bk->bj'
\`\`\`

### Task
Implement multi-head attention using einsum.
    `,
    examples: [
      {
        input: 'Q, K, V with multiple heads',
        output: 'Multi-head attention output',
        explanation: 'Parallel attention across heads',
      },
    ],
    starterCode: `import numpy as np

def multi_head_attention_einsum(Q: np.ndarray, K: np.ndarray, V: np.ndarray,
                                 num_heads: int) -> np.ndarray:
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
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'multi_head_attention_einsum(np.ones((2, 4, 64)), np.ones((2, 4, 64)), np.ones((2, 4, 64)), 8).shape',
        expected: '(2, 4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Output is valid array',
        input: 'not np.isnan(multi_head_attention_einsum(np.ones((2, 4, 64)), np.ones((2, 4, 64)), np.ones((2, 4, 64)), 8)).any()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reshape Q, K, V to (batch, seq, num_heads, d_k)',
      "Use 'bqhd,bkhd->bhqk' for attention scores per head",
      "Use 'bhqk,bkhd->bqhd' for weighted values",
      'Reshape back to (batch, seq, d_model)',
    ],
    solution: `import numpy as np

def multi_head_attention_einsum(Q: np.ndarray, K: np.ndarray, V: np.ndarray,
                                 num_heads: int) -> np.ndarray:
    batch, seq_q, d_model = Q.shape
    seq_k = K.shape[1]
    d_k = d_model // num_heads

    # Reshape to (batch, seq, num_heads, d_k)
    Q = Q.reshape(batch, seq_q, num_heads, d_k)
    K = K.reshape(batch, seq_k, num_heads, d_k)
    V = V.reshape(batch, seq_k, num_heads, d_k)

    # Compute attention scores for all heads
    # (batch, seq_q, heads, d_k) x (batch, seq_k, heads, d_k) -> (batch, heads, seq_q, seq_k)
    scores = np.einsum('bqhd,bkhd->bhqk', Q, K) / np.sqrt(d_k)

    # Softmax
    exp_scores = np.exp(scores - scores.max(axis=-1, keepdims=True))
    attention = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

    # Weighted sum of values
    # (batch, heads, seq_q, seq_k) x (batch, seq_k, heads, d_k) -> (batch, seq_q, heads, d_k)
    output = np.einsum('bhqk,bkhd->bqhd', attention, V)

    # Reshape back to (batch, seq_q, d_model)
    output = output.reshape(batch, seq_q, d_model)

    return output
`,
  },
  {
    id: 'einsum-vs-matmul',
    title: 'Einsum vs Traditional Operations',
    section: 'einsum',
    difficulty: 'easy',
    description: `
## Einsum vs Traditional Operations

Compare einsum with equivalent NumPy operations.

### Equivalences
| Einsum | NumPy |
|--------|-------|
| \`'ij->'\` | \`np.sum(A)\` |
| \`'ij->i'\` | \`np.sum(A, axis=1)\` |
| \`'ik,kj->ij'\` | \`A @ B\` |
| \`'ij,ij->'\` | \`np.sum(A * B)\` |
| \`'ij->ji'\` | \`A.T\` |

### Task
Verify einsum produces same results as traditional operations.

### Expected Return Format
Return a dictionary with:
- \`'results'\`: Dict mapping operation names to {'einsum': ..., 'numpy': ...}
- \`'all_match'\`: Boolean indicating if all einsum results match numpy equivalents
    `,
    examples: [
      {
        input: 'A=[[1,2,3],[4,5,6]], B=[[1,2],[3,4],[5,6]]',
        output: "{'results': {'sum': {...}, 'matmul': {...}, ...}, 'all_match': True}",
        explanation: 'All einsum operations produce identical results to NumPy equivalents',
      },
    ],
    starterCode: `import numpy as np

def einsum_equivalence(A: np.ndarray, B: np.ndarray) -> dict:
    """
    Compare einsum with traditional NumPy operations.

    Args:
        A: First matrix (m, k)
        B: Second matrix (k, n)

    Returns:
        Dictionary with 'einsum' and 'numpy' results for comparison
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'All results match',
        input: 'einsum_equivalence(np.array([[1.0,2.0,3.0],[4.0,5.0,6.0]]), np.array([[1.0,2.0],[3.0,4.0],[5.0,6.0]]))["all_match"]',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Matrix multiplication matches',
        input: 'bool(np.allclose(einsum_equivalence(np.array([[1.0,2.0],[3.0,4.0]]), np.array([[5.0,6.0],[7.0,8.0]]))["results"]["matmul"]["einsum"], np.array([[19.0,22.0],[43.0,50.0]])))',
        expected: 'True',
        hidden: false,
      },
    ],
    hints: [
      'Use np.allclose() to compare floating point arrays',
      "Remember 'ik,kj->ij' is matrix multiplication",
    ],
    solution: `import numpy as np

def einsum_equivalence(A: np.ndarray, B: np.ndarray) -> dict:
    results = {
        'sum': {
            'einsum': np.einsum('ij->', A),
            'numpy': np.sum(A)
        },
        'row_sum': {
            'einsum': np.einsum('ij->i', A),
            'numpy': np.sum(A, axis=1)
        },
        'matmul': {
            'einsum': np.einsum('ik,kj->ij', A, B),
            'numpy': A @ B
        },
        'transpose': {
            'einsum': np.einsum('ij->ji', A),
            'numpy': A.T
        },
        'hadamard_sum': {
            'einsum': np.einsum('ij,ij->', A, A),
            'numpy': np.sum(A * A)
        }
    }

    # Verify all match
    all_match = all(
        np.allclose(v['einsum'], v['numpy'])
        for v in results.values()
    )

    return {'results': results, 'all_match': all_match}
`,
  },
];
