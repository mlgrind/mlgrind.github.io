import { Problem } from '../../types';

export const transformerProblems: Problem[] = [
  {
    id: 'scaled-dot-product-attention',
    title: 'Scaled Dot-Product Attention',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Scaled Dot-Product Attention

Implement the core attention mechanism from "Attention Is All You Need".

### Formula
\`\`\`
Attention(Q, K, V) = softmax(Q @ K.T / sqrt(d_k)) @ V
\`\`\`

Where:
- Q: Queries (seq_len, d_k)
- K: Keys (seq_len, d_k)
- V: Values (seq_len, d_v)
- d_k: Dimension of keys

### Steps
1. Compute attention scores: Q @ K.T
2. Scale by sqrt(d_k)
3. Apply softmax
4. Multiply by V
    `,
    examples: [
      {
        input: 'Q, K, V all (4, 8) - 4 tokens, 8 dims',
        output: 'output (4, 8)',
        explanation: 'Each token attends to all tokens',
      },
    ],
    starterCode: `import numpy as np

def scaled_dot_product_attention(Q, K, V):
    """
    Compute scaled dot-product attention.

    Args:
        Q: Queries (seq_len, d_k)
        K: Keys (seq_len, d_k)
        V: Values (seq_len, d_v)

    Returns:
        output: Attention output (seq_len, d_v)
        attention_weights: Attention weights (seq_len, seq_len)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape correct',
        input: 'scaled_dot_product_attention(np.random.randn(4, 8), np.random.randn(4, 8), np.random.randn(4, 8))[0].shape',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Attention weights sum to 1',
        input: 'bool(np.allclose(scaled_dot_product_attention(np.ones((4, 8)), np.ones((4, 8)), np.ones((4, 8)))[1].sum(axis=-1), 1.0))',
        expected: 'True',
        hidden: false,
      },
    ],
    hints: [
      'Compute scores = Q @ K.T',
      'Scale by sqrt(d_k) where d_k = Q.shape[-1]',
      'Apply softmax along the last axis',
      'Return softmax(scores) @ V',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.shape[-1]

    # Compute attention scores
    scores = Q @ K.T / np.sqrt(d_k)

    # Apply softmax
    attention_weights = softmax(scores)

    # Compute output
    output = attention_weights @ V

    return output, attention_weights
`,
  },
  {
    id: 'multi-head-attention',
    title: 'Multi-Head Attention',
    section: 'transformers',
    difficulty: 'hard',
    description: `
## Multi-Head Attention

Implement multi-head attention from the Transformer architecture.

### Concept
\`\`\`
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) @ W_O

where head_i = Attention(Q @ W_Q_i, K @ W_K_i, V @ W_V_i)
\`\`\`

### Steps
1. Project Q, K, V with different learned projections for each head
2. Apply scaled dot-product attention in parallel
3. Concatenate heads
4. Project back to original dimension
    `,
    examples: [
      {
        input: 'X (4, 64), num_heads=8, d_model=64',
        output: 'output (4, 64)',
        explanation: '8 heads with d_k=8 each, concatenated to 64',
      },
    ],
    starterCode: `import numpy as np

def multi_head_attention(Q, K, V, num_heads):
    """
    Multi-head attention mechanism.

    Args:
        Q: Queries (seq_len, d_model)
        K: Keys (seq_len, d_model)
        V: Values (seq_len, d_model)
        num_heads: Number of attention heads

    Returns:
        output: Multi-head attention output (seq_len, d_model)
    """
    seq_len, d_model = Q.shape
    assert d_model % num_heads == 0
    d_k = d_model // num_heads

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'multi_head_attention(np.random.randn(4, 64), np.random.randn(4, 64), np.random.randn(4, 64), 8).shape',
        expected: '(4, 64)',
        hidden: false,
      },
    ],
    hints: [
      'Reshape Q, K, V to (seq_len, num_heads, d_k)',
      'Apply attention for each head',
      'Reshape back to (seq_len, d_model)',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def multi_head_attention(Q, K, V, num_heads):
    seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    # Reshape to (seq_len, num_heads, d_k)
    Q = Q.reshape(seq_len, num_heads, d_k)
    K = K.reshape(seq_len, num_heads, d_k)
    V = V.reshape(seq_len, num_heads, d_k)

    # Transpose to (num_heads, seq_len, d_k)
    Q = Q.transpose(1, 0, 2)
    K = K.transpose(1, 0, 2)
    V = V.transpose(1, 0, 2)

    # Scaled dot-product attention for each head
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_k)
    attention = softmax(scores)
    heads = attention @ V

    # Transpose and reshape back
    heads = heads.transpose(1, 0, 2)  # (seq_len, num_heads, d_k)
    output = heads.reshape(seq_len, d_model)

    return output
`,
  },
  {
    id: 'positional-encoding',
    title: 'Sinusoidal Positional Encoding',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Sinusoidal Positional Encoding

Implement the positional encoding from the original Transformer paper.

### Formulas
\`\`\`
PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
\`\`\`

Where:
- pos: Position in sequence
- i: Dimension index
- d_model: Model dimension

### Purpose
- Injects position information into embeddings
- Allows model to learn relative positions
- Fixed (not learned) encodings
    `,
    examples: [
      {
        input: 'max_len=100, d_model=512',
        output: 'PE matrix (100, 512)',
        explanation: 'Position encoding for 100 positions',
      },
    ],
    starterCode: `import numpy as np

def positional_encoding(max_len, d_model):
    """
    Generate sinusoidal positional encodings.

    Args:
        max_len: Maximum sequence length
        d_model: Model dimension

    Returns:
        PE: Positional encoding matrix (max_len, d_model)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape',
        input: 'positional_encoding(50, 64).shape',
        expected: '(50, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'First position starts with sin(0)=0',
        input: 'bool(np.isclose(positional_encoding(10, 4)[0, 0], 0.0))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Create position indices: np.arange(max_len)',
      'Create dimension indices for the divisor',
      'Use div_term = 10000^(2i/d_model)',
      'Apply sin to even indices, cos to odd indices',
    ],
    solution: `import numpy as np

def positional_encoding(max_len, d_model):
    PE = np.zeros((max_len, d_model))

    position = np.arange(max_len)[:, np.newaxis]
    div_term = np.exp(np.arange(0, d_model, 2) * (-np.log(10000.0) / d_model))

    PE[:, 0::2] = np.sin(position * div_term)
    PE[:, 1::2] = np.cos(position * div_term)

    return PE
`,
  },
  {
    id: 'layer-norm',
    title: 'Layer Normalization',
    section: 'transformers',
    difficulty: 'easy',
    description: `
## Layer Normalization

Implement layer normalization, used in Transformers instead of batch normalization.

### Formula
\`\`\`
LayerNorm(x) = γ * (x - μ) / sqrt(σ² + ε) + β
\`\`\`

### Difference from BatchNorm
- **BatchNorm**: Normalizes across batch dimension
- **LayerNorm**: Normalizes across feature dimension
- LayerNorm works better for sequence models
    `,
    examples: [
      {
        input: 'X (batch, seq_len, features)',
        output: 'Normalized X, each position normalized independently',
        explanation: 'Normalize across last dimension',
      },
    ],
    starterCode: `import numpy as np

def layer_norm(X, gamma, beta, eps=1e-5):
    """
    Apply layer normalization.

    Args:
        X: Input (batch, seq_len, features) or (seq_len, features)
        gamma: Scale parameter (features,)
        beta: Shift parameter (features,)
        eps: Small constant

    Returns:
        output: Normalized tensor
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output mean near zero',
        input: 'bool(np.allclose(layer_norm(np.array([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), np.ones(4), np.zeros(4)).mean(axis=-1), 0.0, atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Gamma and beta work',
        input: 'bool(np.allclose(layer_norm(np.array([[0.0, 0.0, 2.0, 2.0]]), np.array([1.0, 2.0, 1.0, 2.0]), np.zeros(4)), np.array([[-1.0, -2.0, 1.0, 2.0]])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Compute mean and variance along the last axis',
      'Use keepdims=True for proper broadcasting',
      'Apply normalization: (x - mean) / sqrt(var + eps)',
    ],
    solution: `import numpy as np

def layer_norm(X, gamma, beta, eps=1e-5):
    # Compute statistics along last dimension
    mean = np.mean(X, axis=-1, keepdims=True)
    var = np.var(X, axis=-1, keepdims=True)

    # Normalize
    X_norm = (X - mean) / np.sqrt(var + eps)

    # Scale and shift
    return gamma * X_norm + beta
`,
  },
  {
    id: 'causal-mask',
    title: 'Causal Attention Mask',
    section: 'transformers',
    difficulty: 'easy',
    description: `
## Causal (Autoregressive) Mask

Create a causal mask for decoder self-attention to prevent attending to future tokens.

### Mask Structure
\`\`\`
[[0, -inf, -inf, -inf],
 [0,    0, -inf, -inf],
 [0,    0,    0, -inf],
 [0,    0,    0,    0]]
\`\`\`

### Usage
- Add mask to attention scores before softmax
- -inf becomes 0 after softmax
- Ensures each position only attends to previous positions
    `,
    examples: [
      {
        input: 'seq_len=4',
        output: 'Lower triangular mask (4, 4)',
        explanation: 'Position i can only attend to positions <= i',
      },
    ],
    starterCode: `import numpy as np

def create_causal_mask(seq_len):
    """
    Create a causal attention mask.

    Args:
        seq_len: Sequence length

    Returns:
        mask: Causal mask (seq_len, seq_len)
               0 for allowed positions, -inf for masked
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape and pattern',
        input: 'create_causal_mask(4).shape',
        expected: '(4, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Lower triangular zeros, upper triangular -inf',
        input: 'bool(np.allclose(create_causal_mask(3), np.array([[0.0, float("-inf"), float("-inf")], [0.0, 0.0, float("-inf")], [0.0, 0.0, 0.0]])))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Create a matrix of ones using np.ones((seq_len, seq_len))',
      'Use np.triu to get upper triangular matrix (excluding diagonal)',
      'Replace 1s with -inf',
    ],
    solution: `import numpy as np

def create_causal_mask(seq_len):
    # Create upper triangular matrix (above diagonal)
    mask = np.triu(np.ones((seq_len, seq_len)), k=1)
    # Replace 1s with -inf
    mask = np.where(mask == 1, float('-inf'), 0.0)
    return mask
`,
  },
  {
    id: 'bpe-tokenization',
    title: 'BPE Tokenization',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Byte-Pair Encoding (BPE) Tokenization

Implement the training step of BPE, the tokenization algorithm used by GPT, LLaMA, and most modern LLMs.

### Algorithm
1. Start with words split into individual character tokens
2. Count frequency of all adjacent token pairs across the corpus
3. Merge the most frequent pair into a new token
4. Repeat for \`num_merges\` iterations

### Input Format
- \`word_freqs\`: Dict mapping space-separated token sequences to frequency
  - e.g., \`{"h u g </w>": 10, "p u g </w>": 5}\`
  - \`</w>\` marks end-of-word

### Return Format
Return a list of merge pair tuples, in the order they were applied.

### Why BPE?
- Handles any input text (no unknown tokens)
- Balances character-level and word-level tokenization
- Common subwords become single tokens, rare words split into subwords
    `,
    examples: [
      {
        input: 'word_freqs = {"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, num_merges=3',
        output: "[('u', 'g'), ('ug', '</w>'), ('h', 'ug</w>')]",
        explanation: '"ug" is the most frequent pair (freq 17), merged first',
      },
    ],
    starterCode: `import numpy as np
from collections import Counter

def bpe_train(word_freqs, num_merges):
    """
    Train BPE tokenizer by learning merge rules.

    Args:
        word_freqs: Dict mapping space-separated token sequences to frequency
                    e.g., {"h u g </w>": 10, "p u g </w>": 5}
        num_merges: Number of merge operations to perform

    Returns:
        merges: List of (token_a, token_b) tuples merged, in order
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'First merge is most frequent pair',
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[0]',
        expected: "('u', 'g')",
        hidden: false,
      },
      {
        id: '2',
        description: 'Correct number of merges returned',
        input: 'len(bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3))',
        expected: '3',
        hidden: false,
      },
      {
        id: '3',
        description: 'Second merge builds on first',
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[1]',
        expected: "('ug', '</w>')",
        hidden: true,
      },
      {
        id: '4',
        description: 'Works with different corpus',
        input: 'bpe_train({"a b c </w>": 10, "a b </w>": 7, "b c </w>": 3}, 2)[0]',
        expected: "('a', 'b')",
        hidden: true,
      },
    ],
    hints: [
      'Split each word into tokens using word.split()',
      'Count pair frequencies by iterating adjacent tokens, weighted by word frequency',
      'Find the most frequent pair with max(pair_freqs, key=pair_freqs.get)',
      'Merge the pair: scan tokens left-to-right, joining matching adjacent pairs',
    ],
    solution: `import numpy as np
from collections import Counter

def bpe_train(word_freqs, num_merges):
    # Split each word into tokens
    splits = {word: word.split() for word in word_freqs}
    merges = []

    for _ in range(num_merges):
        # Count pair frequencies
        pair_freqs = Counter()
        for word, freq in word_freqs.items():
            tokens = splits[word]
            for i in range(len(tokens) - 1):
                pair_freqs[(tokens[i], tokens[i + 1])] += freq

        if not pair_freqs:
            break

        # Find and record most frequent pair
        best_pair = max(pair_freqs, key=pair_freqs.get)
        merges.append(best_pair)

        # Merge the pair in all words
        for word in splits:
            tokens = splits[word]
            new_tokens = []
            i = 0
            while i < len(tokens):
                if i < len(tokens) - 1 and (tokens[i], tokens[i + 1]) == best_pair:
                    new_tokens.append(tokens[i] + tokens[i + 1])
                    i += 2
                else:
                    new_tokens.append(tokens[i])
                    i += 1
            splits[word] = new_tokens

    return merges
`,
  },
  {
    id: 'rope-embeddings',
    title: 'Rotary Positional Embeddings (RoPE)',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Rotary Positional Embeddings (RoPE)

Implement RoPE, the positional encoding used by LLaMA, Mistral, GPT-NeoX, and most modern LLMs.

### How It Works
Instead of *adding* position information to embeddings (like sinusoidal encoding), RoPE *rotates* pairs of dimensions in Q and K by position-dependent angles.

### Formulas
For position \`pos\` and dimension pair \`(2i, 2i+1)\`:
\`\`\`
θ_i = 1 / (10000^(2i / d_model))

q_rot[2i]   = q[2i] · cos(pos · θ_i) - q[2i+1] · sin(pos · θ_i)
q_rot[2i+1] = q[2i] · sin(pos · θ_i) + q[2i+1] · cos(pos · θ_i)
\`\`\`

Apply the same rotation to both Q and K.

### Key Properties
- **Relative position awareness**: The dot product between rotated Q and K depends only on the relative position difference
- **Norm preservation**: Rotation does not change vector magnitudes
- **No learned parameters**: Computed directly from position indices

### Why RoPE Over Sinusoidal?
- Encodes *relative* positions naturally (sinusoidal is absolute)
- Better extrapolation to longer sequences
- Applied directly in attention computation (not added to embeddings)
    `,
    examples: [
      {
        input: 'Q, K both (4, 8) - 4 tokens, 8 dims',
        output: 'Q_rot (4, 8), K_rot (4, 8)',
        explanation: 'Each pair of dimensions is rotated by a position-dependent angle',
      },
    ],
    starterCode: `import numpy as np

def apply_rope(Q, K):
    """
    Apply Rotary Positional Embeddings to Q and K.

    Args:
        Q: Queries (seq_len, d_model) where d_model is even
        K: Keys (seq_len, d_model)

    Returns:
        Q_rot: Rotated queries (seq_len, d_model)
        K_rot: Rotated keys (seq_len, d_model)
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'apply_rope(np.ones((4, 8)), np.ones((4, 8)))[0].shape',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Position 0 is unchanged (rotation angle is 0)',
        input: 'bool(np.allclose(apply_rope(np.array([[1.0, 2.0, 3.0, 4.0]]), np.ones((1, 4)))[0], np.array([[1.0, 2.0, 3.0, 4.0]])))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Rotation preserves vector norms',
        input: '(lambda: [np.random.seed(42), (Q := np.random.randn(6, 8)), (Q_rot := apply_rope(Q, Q)[0]), bool(np.allclose(np.linalg.norm(Q_rot, axis=-1), np.linalg.norm(Q, axis=-1)))][-1])()',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Compute θ_i = 1.0 / (10000^(2i/d)) for dimension indices i = 0, 1, ..., d/2-1',
      'Multiply positions (0 to seq_len-1) by θ to get angles matrix (seq_len, d/2)',
      'Even dims: q_even * cos(angles) - q_odd * sin(angles)',
      'Odd dims: q_even * sin(angles) + q_odd * cos(angles)',
    ],
    solution: `import numpy as np

def apply_rope(Q, K):
    seq_len, d = Q.shape

    # Compute rotation angles
    positions = np.arange(seq_len)[:, np.newaxis]  # (seq_len, 1)
    dims = np.arange(0, d, 2)  # (d/2,)
    theta = 1.0 / (10000.0 ** (dims / d))  # (d/2,)
    angles = positions * theta  # (seq_len, d/2)

    cos_a = np.cos(angles)
    sin_a = np.sin(angles)

    # Rotate Q
    Q_rot = np.zeros_like(Q)
    Q_rot[:, 0::2] = Q[:, 0::2] * cos_a - Q[:, 1::2] * sin_a
    Q_rot[:, 1::2] = Q[:, 0::2] * sin_a + Q[:, 1::2] * cos_a

    # Rotate K
    K_rot = np.zeros_like(K)
    K_rot[:, 0::2] = K[:, 0::2] * cos_a - K[:, 1::2] * sin_a
    K_rot[:, 1::2] = K[:, 0::2] * sin_a + K[:, 1::2] * cos_a

    return Q_rot, K_rot
`,
  },
  {
    id: 'grouped-query-attention',
    title: 'Grouped Query Attention (GQA)',
    section: 'transformers',
    difficulty: 'medium',
    description: `
## Grouped Query Attention (GQA)

Implement GQA, the efficient attention variant used in LLaMA 2, Mistral, Gemma, and most modern LLMs.

### Concept
In standard Multi-Head Attention (MHA), each head has its own Q, K, and V projections. GQA reduces memory by sharing KV heads across groups of query heads:

| Variant | Q Heads | KV Heads | Used In |
|---------|---------|----------|---------|
| MHA | H | H | Original Transformer |
| GQA | H | G (1 < G < H) | LLaMA 2, Mistral |
| MQA | H | 1 | PaLM, Falcon |

### Steps
1. Reshape Q into \`num_q_heads\` heads of size \`d_head\`
2. Reshape K, V into \`num_kv_heads\` heads of size \`d_head\`
3. Repeat each KV head \`group_size\` times (group_size = num_q_heads / num_kv_heads)
4. Apply scaled dot-product attention per head
5. Concatenate all heads

### Why GQA?
- Reduces KV cache size by \`num_q_heads / num_kv_heads\` factor
- Faster inference with minimal quality loss vs MHA
- Key optimization for serving large language models
    `,
    examples: [
      {
        input: 'Q (4, 64), K (4, 16), V (4, 16), num_q_heads=8, num_kv_heads=2',
        output: 'output (4, 64)',
        explanation: '8 query heads grouped into 2 KV groups of 4, d_head=8',
      },
    ],
    starterCode: `import numpy as np

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    """
    Grouped Query Attention.

    Args:
        Q: Queries (seq_len, num_q_heads * d_head)
        K: Keys (seq_len, num_kv_heads * d_head)
        V: Values (seq_len, num_kv_heads * d_head)
        num_q_heads: Number of query heads
        num_kv_heads: Number of key/value heads (divides num_q_heads)

    Returns:
        output: (seq_len, num_q_heads * d_head)
    """
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'GQA output shape (8 Q heads, 2 KV heads)',
        input: 'grouped_query_attention(np.random.randn(4, 64), np.random.randn(4, 16), np.random.randn(4, 16), 8, 2).shape',
        expected: '(4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'MQA case (1 KV head shared by all Q heads)',
        input: 'grouped_query_attention(np.random.randn(4, 32), np.random.randn(4, 4), np.random.randn(4, 4), 8, 1).shape',
        expected: '(4, 32)',
        hidden: false,
      },
      {
        id: '3',
        description: 'MHA case (num_q_heads == num_kv_heads)',
        input: 'grouped_query_attention(np.random.randn(4, 64), np.random.randn(4, 64), np.random.randn(4, 64), 8, 8).shape',
        expected: '(4, 64)',
        hidden: true,
      },
    ],
    hints: [
      'Reshape Q to (num_q_heads, seq_len, d_head) using reshape then transpose',
      'Reshape K, V to (num_kv_heads, seq_len, d_head) the same way',
      'Use np.repeat(K, group_size, axis=0) to expand KV heads to match Q heads',
      'Apply attention: softmax(Q @ K^T / sqrt(d_head)) @ V for each head',
      'Transpose and reshape back to (seq_len, num_q_heads * d_head)',
    ],
    solution: `import numpy as np

def softmax(x, axis=-1):
    exp_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return exp_x / np.sum(exp_x, axis=axis, keepdims=True)

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Reshape to per-head format: (num_heads, seq_len, d_head)
    Q = Q.reshape(seq_len, num_q_heads, d_head).transpose(1, 0, 2)
    K = K.reshape(seq_len, num_kv_heads, d_head).transpose(1, 0, 2)
    V = V.reshape(seq_len, num_kv_heads, d_head).transpose(1, 0, 2)

    # Repeat KV heads to match Q heads
    K = np.repeat(K, group_size, axis=0)
    V = np.repeat(V, group_size, axis=0)

    # Scaled dot-product attention per head
    scores = Q @ K.transpose(0, 2, 1) / np.sqrt(d_head)
    attention = softmax(scores, axis=-1)
    heads = attention @ V

    # Concatenate heads
    output = heads.transpose(1, 0, 2).reshape(seq_len, -1)
    return output
`,
  },
  {
    id: 'sliding-window-attention',
    title: 'Sliding Window Attention',
    section: 'transformers',
    difficulty: 'easy',
    description: `
## Sliding Window Attention

Create a sliding window causal attention mask, used in Mistral, Gemma, and other efficient LLMs.

### Concept
Standard causal attention lets each token attend to *all* previous tokens. With long sequences this is expensive (O(n\u00B2) memory). Sliding window attention restricts each token to only attend to the \`window_size\` nearest previous tokens.

### Mask Structure (seq_len=5, window_size=3)
\`\`\`
[[  0, -inf, -inf, -inf, -inf],
 [  0,    0, -inf, -inf, -inf],
 [  0,    0,    0, -inf, -inf],
 [-inf,   0,    0,    0, -inf],
 [-inf, -inf,  0,    0,    0]]
\`\`\`

### Rules
- Position \`i\` can attend to position \`j\` if:
  - \`j <= i\` (causal: no future tokens)
  - \`i - j < window_size\` (within the window)
- Allowed positions get \`0\`, masked positions get \`-inf\`

### Why Sliding Window?
- Reduces memory from O(n\u00B2) to O(n \u00D7 window_size)
- Information still propagates across layers (layer L sees L \u00D7 window_size tokens)
- Combined with full attention layers in some architectures
    `,
    examples: [
      {
        input: 'seq_len=4, window_size=2',
        output: '(4, 4) mask where each token sees at most 2 previous tokens',
        explanation: 'Position 3 attends to positions 2 and 3 only',
      },
    ],
    starterCode: `import numpy as np

def sliding_window_mask(seq_len, window_size):
    """
    Create a sliding window causal attention mask.

    Args:
        seq_len: Sequence length
        window_size: Number of tokens each position can attend to
                     (including itself)

    Returns:
        mask: (seq_len, seq_len) with 0 for allowed, -inf for masked
    """
    # Your code here
    pass
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape',
        input: 'sliding_window_mask(6, 3).shape',
        expected: '(6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Out-of-window position is masked',
        input: 'bool(sliding_window_mask(4, 2)[2, 0] == float("-inf"))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'In-window position is allowed',
        input: 'bool(sliding_window_mask(4, 2)[2, 1] == 0.0)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Large window equals causal mask',
        input: 'bool(np.array_equal(sliding_window_mask(4, 10), np.where(np.triu(np.ones((4, 4)), k=1) == 1, float("-inf"), 0.0)))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Create row and column index grids using np.arange',
      'Allowed condition: (col <= row) AND (row - col < window_size)',
      'Use np.where(allowed, 0.0, float("-inf")) to build the mask',
    ],
    solution: `import numpy as np

def sliding_window_mask(seq_len, window_size):
    rows = np.arange(seq_len)[:, None]
    cols = np.arange(seq_len)[None, :]

    # Causal: can only attend to current or past positions
    # Window: distance must be less than window_size
    allowed = (cols <= rows) & (rows - cols < window_size)

    return np.where(allowed, 0.0, float('-inf'))
`,
  },
];
