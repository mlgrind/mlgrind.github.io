import { Problem } from '../../types';

export const einsumProblems: Problem[] = [
  {
    id: 'einsum-basics',
    title: 'Einsum Fundamentals',
    section: 'einsum',
    difficulty: 'easy',
    description: `
## Einsum Fundamentals

### What you'll build
A function \`einsum_basics(arr)\` that computes five single-matrix operations (total sum, row sums, column sums, transpose and diagonal) using only \`np.einsum\`.

### Background
\`np.einsum(subscripts, *operands)\` describes an operation by labelling each axis with a letter. The rules:
- letters after \`->\` are **kept**, in that order;
- letters that appear in the input but not after \`->\` are **summed over**;
- a letter repeated within one operand (\`'ii'\`) walks the **diagonal**.

Starting with one operand makes the rules easy to see before they're used for matrix products and attention.

### Subscripts for a 2D array \`arr\` of shape \`(m, n)\`
| Subscripts | Result | Shape | Equivalent |
|------------|--------|-------|------------|
| \`'ij->'\` | sum of all entries | scalar | \`arr.sum()\` |
| \`'ij->i'\` | sum of each row (\`j\` is summed) | \`(m,)\` | \`arr.sum(axis=1)\` |
| \`'ij->j'\` | sum of each column (\`i\` is summed) | \`(n,)\` | \`arr.sum(axis=0)\` |
| \`'ij->ji'\` | transpose | \`(n, m)\` | \`arr.T\` |
| \`'ii->i'\` | diagonal (square only) | \`(m,)\` | \`np.diag(arr)\` |

### Inputs
- \`arr\`: 2D numeric array of shape \`(m, n)\`; it may or may not be square.

### Expected Return Format
Return a dictionary with these keys:
- \`'sum_all'\`: sum of all elements (scalar)
- \`'row_sum'\`: sum of each row, shape \`(m,)\`
- \`'col_sum'\`: sum of each column, shape \`(n,)\`
- \`'transpose'\`: the transposed array, shape \`(n, m)\`
- \`'diagonal'\`: the diagonal, shape \`(m,)\`, if \`arr\` is square; otherwise \`None\`

### Edge cases and conventions
- \`'ii->i'\` needs both axes to have the same size; on a non-square array it raises an error, so check \`arr.shape[0] == arr.shape[1]\` first and return \`None\` otherwise.
- Integer input gives integer results.

### Constraints
Compute every value with \`np.einsum\` (that's the point of the exercise).

### Follow-up
- What does \`'ii->'\` compute? And \`np.einsum('ji', arr)\`, with no arrow?
    `,
    examples: [
      {
        input: 'einsum_basics(np.array([[1, 2], [3, 4]]))',
        output: "{'sum_all': 10, 'row_sum': array([3, 7]), 'col_sum': array([4, 6]), 'transpose': array([[1, 3], [2, 4]]), 'diagonal': array([1, 4])}",
        explanation: 'Square input, so the diagonal [arr[0, 0], arr[1, 1]] is defined.',
      },
      {
        input: 'einsum_basics(np.array([[1, 2, 3], [4, 5, 6]]))',
        output: "{'sum_all': 21, 'row_sum': array([ 6, 15]), 'col_sum': array([5, 7, 9]), 'transpose': array([[1, 4], [2, 5], [3, 6]]), 'diagonal': None}",
        explanation: 'A 2 x 3 array has no square diagonal, so diagonal is None.',
      },
    ],
    starterCode: `import numpy as np

def einsum_basics(arr: np.ndarray) -> dict:
    """
    Single-matrix operations with np.einsum.

    Args:
        arr: 2D array of shape (m, n)

    Returns:
        dict with keys:
            'sum_all':   sum of all elements (scalar)
            'row_sum':   row sums, shape (m,)
            'col_sum':   column sums, shape (n,)
            'transpose': arr transposed, shape (n, m)
            'diagonal':  diagonal, shape (m,), if arr is square, else None
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
      {
        id: '3',
        description: 'Row sums',
        input: 'einsum_basics(np.array([[1, 2], [3, 4]]))["row_sum"].tolist()',
        expected: '[3, 7]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Column sums',
        input: 'einsum_basics(np.array([[1, 2], [3, 4]]))["col_sum"].tolist()',
        expected: '[4, 6]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Diagonal extraction',
        input: 'einsum_basics(np.array([[1, 2], [3, 4]]))["diagonal"].tolist()',
        expected: '[1, 4]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Non-square 2 x 3: sums, transpose and no diagonal',
        input: '(lambda r: (r["row_sum"].tolist(), r["col_sum"].tolist(), r["transpose"].tolist(), r["diagonal"] is None))(einsum_basics(np.array([[1, 2, 3], [4, 5, 6]])))',
        expected: '([6, 15], [5, 7, 9], [[1, 4], [2, 5], [3, 6]], True)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Diagonal of a 3 x 3 matrix',
        input: 'einsum_basics(np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))["diagonal"].tolist()',
        expected: '[1, 5, 9]',
        hidden: true,
      },
    ],
    hints: [
      'For each output, ask: which axes survive? Those letters go after the arrow; the rest are summed away.',
      "Label arr's axes 'ij'. Keep nothing for the total, keep i for row sums, keep j for column sums, and write the kept letters in swapped order for the transpose.",
      "np.einsum('ij->', arr), 'ij->i', 'ij->j', 'ij->ji', and 'ii->i' for the diagonal.",
      "Pitfall: 'ij->i' keeps i, so it sums over j and gives one value per row (not per column). And 'ii->i' raises an error on non-square input: check the shape first.",
    ],
    solution: `import numpy as np

def einsum_basics(arr: np.ndarray) -> dict:
    """
    Returns:
        dict with 'sum_all', 'row_sum', 'col_sum', 'transpose' and
        'diagonal' (None when arr is not square).
    """
    is_square = arr.shape[0] == arr.shape[1]
    return {
        'sum_all': np.einsum('ij->', arr),      # no letters kept: sum everything
        'row_sum': np.einsum('ij->i', arr),     # keep i, sum over j
        'col_sum': np.einsum('ij->j', arr),     # keep j, sum over i
        'transpose': np.einsum('ij->ji', arr),  # keep both, swapped
        # A repeated letter walks the diagonal; it needs equal axis sizes
        'diagonal': np.einsum('ii->i', arr) if is_square else None,
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

### What you'll build
A function \`einsum_matrix_ops(A, B, v)\` that computes six two-operand products (matrix multiply, matrix-vector, outer, Hadamard, Frobenius inner product and trace) with \`np.einsum\`.

### Background
With two operands, a letter shared between them pairs up their axes. If that letter is missing from the output, the paired axis is **contracted** (multiplied and summed), which is how a matrix product works. If it's kept, the entries are just multiplied elementwise. Every linear layer, attention score and bilinear model is one of these patterns.

### Formulas
| Key | Subscripts | Formula | Shape |
|-----|------------|---------|-------|
| \`matmul\` | \`'ik,kj->ij'\` | \`C[i, j] = sum_k A[i, k] * B[k, j]\` | \`(m, n)\` |
| \`matvec\` | \`'ij,j->i'\` | \`y[i] = sum_j A[i, j] * v[j]\` | \`(m,)\` |
| \`outer_product\` | \`'i,j->ij'\` | \`O[i, j] = v[i] * v[j]\` | \`(k, k)\` |
| \`hadamard\` | \`'ij,ij->ij'\` | \`H[i, j] = A[i, j] * A[i, j]\` | \`(m, k)\` |
| \`frobenius\` | \`'ij,ij->'\` | \`sum_ij A[i, j] * A[i, j]\` | scalar |
| \`trace\` | \`'ii->'\` | \`sum_i A[i, i]\` | scalar |

### Inputs
- \`A\`: matrix of shape \`(m, k)\`
- \`B\`: matrix of shape \`(k, n)\`
- \`v\`: vector of shape \`(k,)\`

### Expected Return Format
Return a dictionary with these keys:
- \`'matmul'\`: \`A @ B\`, shape \`(m, n)\`
- \`'matvec'\`: \`A @ v\`, shape \`(m,)\`
- \`'outer_product'\`: outer product of \`v\` with itself, shape \`(k, k)\`
- \`'hadamard'\`: elementwise \`A * A\`, shape \`(m, k)\`
- \`'frobenius'\`: Frobenius inner product of \`A\` with itself, \`(A * A).sum()\` (the squared Frobenius norm), a scalar
- \`'trace'\`: trace of \`A\` if \`A\` is square, otherwise \`None\`

### Edge cases and conventions
- \`'ii->'\` requires a square \`A\`; return \`None\` for the trace when \`m != k\`.
- Integer inputs give integer outputs.

### Constraints
Compute every value with \`np.einsum\`.

### Follow-up
- Write \`u^T A w\` (a bilinear form) as a single einsum with three operands.
- What is the cost of \`'ik,kj->ij'\` in terms of \`m\`, \`k\` and \`n\`?
    `,
    examples: [
      {
        input: 'einsum_matrix_ops(np.array([[1, 2], [3, 4]]), np.array([[5, 6], [7, 8]]), np.array([1, 2]))',
        output: "{'matmul': array([[19, 22], [43, 50]]), 'matvec': array([ 5, 11]), 'outer_product': array([[1, 2], [2, 4]]), 'hadamard': array([[ 1,  4], [ 9, 16]]), 'frobenius': 30, 'trace': 5}",
        explanation: 'matvec[0] = 1*1 + 2*2 = 5; frobenius = 1 + 4 + 9 + 16 = 30; trace = 1 + 4 = 5.',
      },
      {
        input: 'einsum_matrix_ops(np.array([[1, 0, 2]]), np.array([[1], [2], [3]]), np.array([1, 1, 1]))["trace"]',
        output: 'None',
        explanation: 'A is 1 x 3, not square, so it has no trace.',
      },
    ],
    starterCode: `import numpy as np

def einsum_matrix_ops(A: np.ndarray, B: np.ndarray, v: np.ndarray) -> dict:
    """
    Two-operand products with np.einsum.

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
            'frobenius':     (A * A).sum(), scalar
            'trace':         trace of A if square, else None
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
      {
        id: '3',
        description: 'Matrix-vector product',
        input: 'einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["matvec"].tolist()',
        expected: '[5, 11]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Frobenius inner product',
        input: 'int(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["frobenius"])',
        expected: '30',
        hidden: true,
      },
      {
        id: '5',
        description: 'Trace of square matrix',
        input: 'int(einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["trace"])',
        expected: '5',
        hidden: true,
      },
      {
        id: '6',
        description: 'Hadamard product',
        input: 'einsum_matrix_ops(np.array([[1,2],[3,4]]), np.array([[5,6],[7,8]]), np.array([1,2]))["hadamard"].tolist()',
        expected: '[[1, 4], [9, 16]]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Non-square A (1 x 3): products and no trace',
        input: '(lambda r: (r["matmul"].tolist(), r["matvec"].tolist(), r["outer_product"].shape, int(r["frobenius"]), r["trace"] is None))(einsum_matrix_ops(np.array([[1, 0, 2]]), np.array([[1], [2], [3]]), np.array([1, 1, 1])))',
        expected: '([[7]], [3], (3, 3), 5, True)',
        hidden: true,
      },
    ],
    hints: [
      'Write down the shape of each result. Which letters must appear after the arrow, and which are shared but disappear?',
      'A shared letter missing from the output is multiplied and summed (contracted); a shared letter kept in the output is just multiplied elementwise; letters from different operands with nothing in common give an outer product.',
      "'ik,kj->ij' (matmul), 'ij,j->i' (matvec), 'i,j->ij' (outer), 'ij,ij->ij' (Hadamard), 'ij,ij->' (Frobenius) and 'ii->' (trace).",
      "Pitfall: 'ij,ij->ij' keeps both letters, so nothing is summed; dropping them ('->') gives the scalar. And 'ii->' fails on non-square A, so return None there.",
    ],
    solution: `import numpy as np

def einsum_matrix_ops(A: np.ndarray, B: np.ndarray, v: np.ndarray) -> dict:
    """
    Returns:
        dict with 'matmul', 'matvec', 'outer_product', 'hadamard',
        'frobenius' and 'trace' (None when A is not square).
    """
    is_square = A.shape[0] == A.shape[1]
    return {
        'matmul': np.einsum('ik,kj->ij', A, B),     # k shared and dropped: contracted
        'matvec': np.einsum('ij,j->i', A, v),
        'outer_product': np.einsum('i,j->ij', v, v),  # no shared letter: outer product
        'hadamard': np.einsum('ij,ij->ij', A, A),   # shared and kept: elementwise
        'frobenius': np.einsum('ij,ij->', A, A),    # elementwise, then sum everything
        'trace': np.einsum('ii->', A) if is_square else None,
    }
    # matmul costs O(m * k * n); the others are O(m * k) or O(k^2).
`,
  },
  {
    id: 'einsum-batch-ops',
    title: 'Batch Operations with Einsum',
    section: 'einsum',
    difficulty: 'medium',
    description: `
## Batch Operations with Einsum

### What you'll build
A function \`einsum_batch_ops(Q, K, V)\` that computes batched scaled dot-product attention with two einsums: raw scores, softmax weights and the weighted sum of values.

### Background
Batched operations add a letter (here \`b\`) that appears in every operand **and** in the output, so it is carried through untouched: every batch element gets its own independent product. Attention is the canonical example. Each query is compared with every key, the scores are turned into weights with a softmax, and the output is the weighted average of the values.

### Formula
With \`d\` the feature dimension of \`Q\` and \`K\` (\`d = Q.shape[-1]\`):
1. Scores (unscaled):
   \`\`\`text
   scores[b, q, k] = sum_d Q[b, q, d] * K[b, k, d]          einsum 'bqd,bkd->bqk'
   \`\`\`
2. Weights: softmax over the **keys** (last axis) of the scaled scores:
   \`\`\`text
   weights[b, q, :] = softmax(scores[b, q, :] / sqrt(d))
   softmax(x)_k = exp(x_k - max(x)) / sum_j exp(x_j - max(x))
   \`\`\`
3. Output:
   \`\`\`text
   output[b, q, v] = sum_k weights[b, q, k] * V[b, k, v]    einsum 'bqk,bkv->bqv'
   \`\`\`

### Inputs
- \`Q\`: queries, float array of shape \`(batch, seq_q, d)\`
- \`K\`: keys, float array of shape \`(batch, seq_k, d)\`
- \`V\`: values, float array of shape \`(batch, seq_k, d_v)\`

### Expected Return Format
Return a dictionary with these keys:
- \`'scores'\`: raw (unscaled) scores \`Q @ K^T\` per batch, shape \`(batch, seq_q, seq_k)\`
- \`'attention_weights'\`: \`softmax(scores / sqrt(d))\` over the last axis, shape \`(batch, seq_q, seq_k)\`; each row sums to 1
- \`'output'\`: weighted sum of values, shape \`(batch, seq_q, d_v)\`

### Edge cases and conventions
- Subtract the row maximum before \`exp\` so large scores don't overflow; this doesn't change the softmax.
- \`'scores'\` is **before** scaling; only the weights use \`/ sqrt(d)\`.

### Constraints
Use \`np.einsum\` for both products (no explicit transposes or \`@\`) and NumPy for the softmax.

### Follow-up
- What is the time and memory cost in terms of \`batch\`, \`seq_q\`, \`seq_k\`, \`d\`? Which term dominates for long sequences?
- Why divide by \`sqrt(d)\` at all?
    `,
    examples: [
      {
        input: 'Q = np.array([[[1., 0.], [0., 1.]]])            # (1, 2, 2)\nK = np.array([[[1., 1.], [2., 0.], [0., 3.]]])  # (1, 3, 2)\nV = np.array([[[1., 0.], [0., 1.], [1., 1.]]])  # (1, 3, 2)\nr = einsum_batch_ops(Q, K, V)\nr["scores"]',
        output: 'array([[[1., 2., 0.],\n        [1., 0., 3.]]])',
        explanation: 'Query 0 = [1, 0] picks feature 0 of each key; query 1 = [0, 1] picks feature 1.',
      },
      {
        input: 'np.round(r["attention_weights"], 4)',
        output: 'array([[[0.284 , 0.576 , 0.14  ],\n        [0.1784, 0.0879, 0.7337]]])',
        explanation: 'Softmax of each score row divided by sqrt(2); each row sums to 1.',
      },
      {
        input: 'np.round(r["output"], 4)',
        output: 'array([[[0.424 , 0.716 ],\n        [0.9121, 0.8216]]])',
        explanation: 'Query 0: 0.284*[1, 0] + 0.576*[0, 1] + 0.140*[1, 1] = [0.424, 0.716].',
      },
    ],
    starterCode: `import numpy as np

def einsum_batch_ops(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> dict:
    """
    Batched scaled dot-product attention with np.einsum.

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
      {
        id: '3',
        description: 'Attention weights sum to 1',
        input: 'bool(np.allclose(einsum_batch_ops(np.random.randn(2, 4, 8), np.random.randn(2, 6, 8), np.random.randn(2, 6, 16))["attention_weights"].sum(axis=-1), 1.0))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Attention weights shape',
        input: 'einsum_batch_ops(np.ones((2, 4, 8)), np.ones((2, 6, 8)), np.ones((2, 6, 16)))["attention_weights"].shape',
        expected: '(2, 4, 6)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Raw scores of a small example',
        input: 'einsum_batch_ops(np.array([[[1., 0.], [0., 1.]]]), np.array([[[1., 1.], [2., 0.], [0., 3.]]]), np.array([[[1., 0.], [0., 1.], [1., 1.]]]))["scores"].tolist()',
        expected: '[[[1.0, 2.0, 0.0], [1.0, 0.0, 3.0]]]',
        hidden: false,
      },
      {
        id: '6',
        description: 'Scores equal Q @ K^T (unscaled)',
        input: `(lambda: (
    Q := np.random.randn(2, 3, 4),
    K := np.random.randn(2, 5, 4),
    V := np.random.randn(2, 5, 6),
    bool(np.allclose(einsum_batch_ops(Q, K, V)["scores"], Q @ K.transpose(0, 2, 1)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Weights and output match scaled softmax attention',
        input: `(lambda: (
    Q := np.random.randn(2, 3, 4),
    K := np.random.randn(2, 5, 4),
    V := np.random.randn(2, 5, 6),
    s := Q @ K.transpose(0, 2, 1) / 2.0,
    w := np.exp(s) / np.exp(s).sum(axis=-1, keepdims=True),
    r := einsum_batch_ops(Q, K, V),
    bool(np.allclose(r["attention_weights"], w) and np.allclose(r["output"], w @ V))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'The batch letter b must appear in every operand and in the output, so each batch element is handled independently.',
      'Three steps: an einsum for the scores (contract the feature axis d), a softmax over the key axis, then an einsum that contracts the key axis k with V.',
      "'bqd,bkd->bqk' for the scores and 'bqk,bkv->bqv' for the output. Softmax: e = np.exp(x - x.max(axis=-1, keepdims=True)); e / e.sum(axis=-1, keepdims=True).",
      "Pitfall: return the scores before scaling, but scale by 1/sqrt(d) before the softmax. And normalise over the keys (axis=-1), not the queries.",
    ],
    solution: `import numpy as np

def einsum_batch_ops(Q: np.ndarray, K: np.ndarray, V: np.ndarray) -> dict:
    """
    Returns:
        dict with 'scores' (batch, seq_q, seq_k), 'attention_weights'
        (batch, seq_q, seq_k) and 'output' (batch, seq_q, d_v).
    """
    # scores[b, q, k] = sum_d Q[b, q, d] * K[b, k, d]   (b is kept, d is contracted)
    scores = np.einsum('bqd,bkd->bqk', Q, K)

    # Scale, then a numerically stable softmax over the keys (last axis)
    scaled = scores / np.sqrt(Q.shape[-1])
    exp_scores = np.exp(scaled - scaled.max(axis=-1, keepdims=True))
    attention_weights = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

    # output[b, q, v] = sum_k weights[b, q, k] * V[b, k, v]
    output = np.einsum('bqk,bkv->bqv', attention_weights, V)

    return {
        'scores': scores,
        'attention_weights': attention_weights,
        'output': output,
    }
    # Time O(batch * seq_q * seq_k * (d + d_v)); memory O(batch * seq_q * seq_k) for the weights.
`,
  },
  {
    id: 'einsum-advanced',
    title: 'Multi-Head Attention with Einsum',
    section: 'einsum',
    difficulty: 'hard',
    description: `
## Multi-Head Attention with Einsum

### What you'll build
A function \`multi_head_attention_einsum(Q, K, V, num_heads)\` that splits \`d_model\` into heads, runs scaled dot-product attention in every head at once with einsum, and merges the heads back.

### Background
Multi-head attention lets each head attend to different positions using its own slice of the features. The usual implementation reshapes to \`(batch, seq, heads, d_k)\` and then transposes to \`(batch, heads, seq, d_k)\` before two batched matmuls. With einsum you can skip the transposes: put the head letter \`h\` where it already is and let the subscripts reorder axes for you. This problem covers only the attention core; the learned projections \`W_Q\`, \`W_K\`, \`W_V\`, \`W_O\` of a full layer are left out (see **Multi-Head Attention** in the Transformers section).

### Algorithm
Let \`H = num_heads\` and \`d_k = d_model / H\`.
1. **Split heads**: reshape \`Q\` to \`(batch, seq_q, H, d_k)\` and \`K\`, \`V\` to \`(batch, seq_k, H, d_k)\`. Head \`h\` owns feature channels \`h*d_k\` to \`(h+1)*d_k - 1\`.
2. **Scores per head**:
   \`\`\`text
   scores[b, h, q, k] = sum_d Q[b, q, h, d] * K[b, k, h, d] / sqrt(d_k)     einsum 'bqhd,bkhd->bhqk'
   \`\`\`
3. **Softmax** over the key axis (last axis) of \`scores\`, giving \`A\` of shape \`(batch, H, seq_q, seq_k)\`.
4. **Weighted values**:
   \`\`\`text
   out[b, q, h, d] = sum_k A[b, h, q, k] * V[b, k, h, d]                   einsum 'bhqk,bkhd->bqhd'
   \`\`\`
5. **Merge heads**: reshape \`out\` to \`(batch, seq_q, d_model)\`.

### Inputs
- \`Q\`: queries, float array of shape \`(batch, seq_q, d_model)\`
- \`K\`: keys, float array of shape \`(batch, seq_k, d_model)\`
- \`V\`: values, float array of shape \`(batch, seq_k, d_model)\`
- \`num_heads\`: positive integer that divides \`d_model\`

### Expected Return Format
A float array of shape \`(batch, seq_q, d_model)\`. Output channels \`h*d_k .. (h+1)*d_k - 1\` come from head \`h\`.

### Edge cases and conventions
- Scale by \`sqrt(d_k)\` (the per-head size), not \`sqrt(d_model)\`.
- Use a numerically stable softmax (subtract the row max before \`exp\`).
- With \`num_heads = 1\` the result is plain single-head attention.

### Constraints
Use \`reshape\` and \`np.einsum\`; no explicit \`transpose\`, no loops over heads.

### Follow-up
- Count the FLOPs: does splitting into \`H\` heads change the total cost compared with one head of size \`d_model\`?
- How would you add a causal mask, and in which step?
    `,
    examples: [
      {
        input: 'X = np.array([[[1., 0.], [0., 1.]]])    # (batch=1, seq=2, d_model=2)\nnp.round(multi_head_attention_einsum(X, X, X, 2), 4)',
        output: 'array([[[0.7311, 0.5   ],\n        [0.5   , 0.7311]]])',
        explanation: 'Head 0 sees channel 0: query 0 scores the keys [1, 0], softmax [0.731, 0.269], output 0.731. Head 1 sees channel 1: query 0 scores [0, 0], uniform weights, output 0.5.',
      },
      {
        input: 'np.round(multi_head_attention_einsum(X, X, X, 1), 4)',
        output: 'array([[[0.6698, 0.3302],\n        [0.3302, 0.6698]]])',
        explanation: 'With one head every channel shares the same weights: softmax([1, 0] / sqrt(2)) = [0.670, 0.330].',
      },
    ],
    starterCode: `import numpy as np

def multi_head_attention_einsum(Q: np.ndarray, K: np.ndarray, V: np.ndarray,
                                 num_heads: int) -> np.ndarray:
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
        input: 'bool(not np.isnan(multi_head_attention_einsum(np.ones((2, 4, 64)), np.ones((2, 4, 64)), np.ones((2, 4, 64)), 8)).any())',
        expected: 'True',
        hidden: true,
      },
      {
        id: '3',
        description: 'Different d_model',
        input: 'multi_head_attention_einsum(np.ones((1, 3, 32)), np.ones((1, 3, 32)), np.ones((1, 3, 32)), 4).shape',
        expected: '(1, 3, 32)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Single head',
        input: 'multi_head_attention_einsum(np.random.randn(2, 4, 8), np.random.randn(2, 4, 8), np.random.randn(2, 4, 8), 1).shape',
        expected: '(2, 4, 8)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Two heads on a 2-channel example',
        input: 'np.round(multi_head_attention_einsum(np.array([[[1., 0.], [0., 1.]]]), np.array([[[1., 0.], [0., 1.]]]), np.array([[[1., 0.], [0., 1.]]]), 2), 4).tolist()',
        expected: '[[[0.7311, 0.5], [0.5, 0.7311]]]',
        hidden: false,
      },
      {
        id: '6',
        description: 'One head equals single-head attention',
        input: `(lambda: (
    Q := np.random.randn(2, 3, 8),
    K := np.random.randn(2, 5, 8),
    V := np.random.randn(2, 5, 8),
    s := Q @ K.transpose(0, 2, 1) / np.sqrt(8),
    ref := (np.exp(s) / np.exp(s).sum(axis=-1, keepdims=True)) @ V,
    bool(np.allclose(multi_head_attention_einsum(Q, K, V, 1), ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Each head attends independently with sqrt(d_k) scaling (2 heads)',
        input: `(lambda: (
    Q := np.random.randn(2, 3, 8),
    K := np.random.randn(2, 5, 8),
    V := np.random.randn(2, 5, 8),
    out := multi_head_attention_einsum(Q, K, V, 2),
    s := Q[:, :, 4:] @ K[:, :, 4:].transpose(0, 2, 1) / 2.0,
    ref := (np.exp(s) / np.exp(s).sum(axis=-1, keepdims=True)) @ V[:, :, 4:],
    bool(np.allclose(out[:, :, 4:], ref))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Each head is ordinary attention on its own d_k-wide slice of the features. Reshaping exposes that slice as a separate axis.',
      'Reshape Q, K, V to (batch, seq, num_heads, d_k); compute per-head scores; softmax over keys; weight the values; reshape back to (batch, seq_q, d_model).',
      "np.einsum('bqhd,bkhd->bhqk', Q, K) / np.sqrt(d_k) for the scores and np.einsum('bhqk,bkhd->bqhd', A, V) for the output. Putting q before h in the output means the final reshape needs no transpose.",
      'Pitfall: scale by sqrt(d_k), not sqrt(d_model), and softmax over the last (key) axis. If you produce (batch, heads, seq_q, d_k), reshaping it directly to (batch, seq_q, d_model) silently mixes heads and positions.',
    ],
    solution: `import numpy as np

def multi_head_attention_einsum(Q: np.ndarray, K: np.ndarray, V: np.ndarray,
                                 num_heads: int) -> np.ndarray:
    """
    Returns:
        output: (batch, seq_q, d_model); channels h*d_k:(h+1)*d_k come from head h.
    """
    batch, seq_q, d_model = Q.shape
    seq_k = K.shape[1]
    d_k = d_model // num_heads

    # 1. Split heads: (batch, seq, num_heads, d_k); head h owns channels h*d_k:(h+1)*d_k
    Q = Q.reshape(batch, seq_q, num_heads, d_k)
    K = K.reshape(batch, seq_k, num_heads, d_k)
    V = V.reshape(batch, seq_k, num_heads, d_k)

    # 2. Scores for every head at once: (batch, heads, seq_q, seq_k)
    scores = np.einsum('bqhd,bkhd->bhqk', Q, K) / np.sqrt(d_k)

    # 3. Stable softmax over the keys
    exp_scores = np.exp(scores - scores.max(axis=-1, keepdims=True))
    attention = exp_scores / exp_scores.sum(axis=-1, keepdims=True)

    # 4. Weighted values, written straight into (batch, seq_q, heads, d_k) order
    output = np.einsum('bhqk,bkhd->bqhd', attention, V)

    # 5. Merge heads: adjacent (heads, d_k) axes flatten back into d_model
    return output.reshape(batch, seq_q, d_model)
    # Time O(batch * seq_q * seq_k * d_model), the same as one big head;
    # memory O(batch * heads * seq_q * seq_k) for the attention weights.
`,
  },
  {
    id: 'einsum-vs-matmul',
    title: 'Einsum vs Traditional Operations',
    section: 'einsum',
    difficulty: 'easy',
    description: `
## Einsum vs Traditional Operations

### What you'll build
A function \`einsum_equivalence(A, B)\` that computes five operations twice, once with \`np.einsum\` and once with the usual NumPy call, and reports whether every pair matches.

### Background
In code reviews and interviews you'll need to translate fluently in both directions: read \`'ik,kj->ij'\` as \`A @ B\`, and write \`A.sum(axis=1)\` as \`'ij->i'\`. Checking the two against each other is also how you debug an einsum you're unsure of.

### The five operations
| Key | Einsum | NumPy equivalent |
|-----|--------|------------------|
| \`'sum'\` | \`np.einsum('ij->', A)\` | \`np.sum(A)\` |
| \`'row_sum'\` | \`np.einsum('ij->i', A)\` | \`np.sum(A, axis=1)\` |
| \`'matmul'\` | \`np.einsum('ik,kj->ij', A, B)\` | \`A @ B\` |
| \`'transpose'\` | \`np.einsum('ij->ji', A)\` | \`A.T\` |
| \`'hadamard_sum'\` | \`np.einsum('ij,ij->', A, A)\` | \`np.sum(A * A)\` |

Note that \`'hadamard_sum'\` multiplies \`A\` with **itself** (the squared Frobenius norm of \`A\`); \`B\` is only used for \`'matmul'\`.

### Inputs
- \`A\`: float matrix of shape \`(m, k)\`
- \`B\`: float matrix of shape \`(k, n)\`

### Expected Return Format
Return a dictionary with two keys:
- \`'results'\`: a dict with exactly the five keys \`'sum'\`, \`'row_sum'\`, \`'matmul'\`, \`'transpose'\`, \`'hadamard_sum'\`. Each value is a dict \`{'einsum': <einsum result>, 'numpy': <NumPy result>}\`.
- \`'all_match'\`: a Python \`bool\`, \`True\` if every einsum result is close to its NumPy counterpart (\`np.allclose\`).

### Edge cases and conventions
- Compare with \`np.allclose\`, not \`==\`: floating-point sums can differ in the last bits depending on summation order.
- \`all(...)\` over the comparisons returns a Python \`bool\`; \`np.all\` would return \`np.bool_\`.

### Constraints
NumPy only.

### Follow-up
- Which of these einsums is a view and which creates a new array?
- For \`'ik,kj->ij'\` on large matrices, which is faster in practice, einsum or \`@\`, and why?
    `,
    examples: [
      {
        input: 'r = einsum_equivalence(np.array([[1., 2., 3.], [4., 5., 6.]]), np.array([[1., 2.], [3., 4.], [5., 6.]]))\nr["all_match"]',
        output: 'True',
        explanation: 'Every einsum result matches its NumPy equivalent.',
      },
      {
        input: 'r["results"]["matmul"]["einsum"]',
        output: 'array([[22., 28.],\n       [49., 64.]])',
        explanation: '(2, 3) @ (3, 2): for example 22 = 1*1 + 2*3 + 3*5.',
      },
      {
        input: 'r["results"]["hadamard_sum"]',
        output: "{'einsum': 91.0, 'numpy': 91.0}",
        explanation: '1 + 4 + 9 + 16 + 25 + 36 = 91: A times itself, summed.',
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
        dict with keys:
            'results':   {'sum', 'row_sum', 'matmul', 'transpose', 'hadamard_sum'},
                         each mapping to {'einsum': ..., 'numpy': ...}
            'all_match': Python bool, True if every pair is np.allclose
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
      {
        id: '3',
        description: 'Transpose matches',
        input: 'bool(np.allclose(einsum_equivalence(np.array([[1.0,2.0,3.0],[4.0,5.0,6.0]]), np.array([[1.0,2.0],[3.0,4.0],[5.0,6.0]]))["results"]["transpose"]["einsum"], np.array([[1.0,4.0],[2.0,5.0],[3.0,6.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Sum matches',
        input: 'float(einsum_equivalence(np.array([[1.0,2.0],[3.0,4.0]]), np.array([[5.0,6.0],[7.0,8.0]]))["results"]["sum"]["einsum"])',
        expected: '10.0',
        hidden: true,
      },
      {
        id: '5',
        description: 'All five operations present',
        input: 'sorted(einsum_equivalence(np.ones((2, 3)), np.ones((3, 2)))["results"].keys())',
        expected: '["hadamard_sum", "matmul", "row_sum", "sum", "transpose"]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Hadamard sum and row sums, both versions',
        input: '(lambda r: (float(r["hadamard_sum"]["einsum"]), float(r["hadamard_sum"]["numpy"]), r["row_sum"]["einsum"].tolist(), r["row_sum"]["numpy"].tolist()))(einsum_equivalence(np.array([[1.0,2.0,3.0],[4.0,5.0,6.0]]), np.array([[1.0,2.0],[3.0,4.0],[5.0,6.0]]))["results"])',
        expected: '(91.0, 91.0, [6.0, 15.0], [6.0, 15.0])',
        hidden: true,
      },
    ],
    hints: [
      'Build one small dict per operation holding both versions, then check them all at the end.',
      "Use the table: for each key, the einsum string on one side and the familiar NumPy call on the other. 'hadamard_sum' uses A twice.",
      "results['matmul'] = {'einsum': np.einsum('ik,kj->ij', A, B), 'numpy': A @ B}; then all_match = all(np.allclose(r['einsum'], r['numpy']) for r in results.values()).",
      "Pitfall: compare floats with np.allclose rather than ==, and use exactly the key names 'sum', 'row_sum', 'matmul', 'transpose', 'hadamard_sum'.",
    ],
    solution: `import numpy as np

def einsum_equivalence(A: np.ndarray, B: np.ndarray) -> dict:
    """
    Returns:
        dict with 'results' (five {'einsum', 'numpy'} pairs) and
        'all_match' (Python bool).
    """
    results = {
        'sum': {'einsum': np.einsum('ij->', A), 'numpy': np.sum(A)},
        'row_sum': {'einsum': np.einsum('ij->i', A), 'numpy': np.sum(A, axis=1)},
        'matmul': {'einsum': np.einsum('ik,kj->ij', A, B), 'numpy': A @ B},
        'transpose': {'einsum': np.einsum('ij->ji', A), 'numpy': A.T},
        'hadamard_sum': {'einsum': np.einsum('ij,ij->', A, A), 'numpy': np.sum(A * A)},
    }

    # Built-in all() returns a Python bool; allclose tolerates rounding differences
    all_match = all(np.allclose(r['einsum'], r['numpy']) for r in results.values())

    return {'results': results, 'all_match': all_match}
`,
  },
];
