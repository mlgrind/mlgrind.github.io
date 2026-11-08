import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../transformers.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const transformersPyTorch: Record<string, LanguageVariant> = {
  'scaled-dot-product-attention': {
    note: "Implement with matmul and softmax. Don't use F.scaled_dot_product_attention or nn.MultiheadAttention; a hidden test compares against F.scaled_dot_product_attention.",
    starterCode: `import math
import torch

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
    solution: `import math
import torch

def scaled_dot_product_attention(Q, K, V):
    d_k = Q.shape[-1]

    # Similarity of every query with every key, scaled by sqrt(d_k)
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)

    # Each row becomes a probability distribution over keys
    attention_weights = torch.softmax(scores, dim=-1)

    output = attention_weights @ V
    return output, attention_weights
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape correct',
        input: 'scaled_dot_product_attention(torch.randn(4, 8), torch.randn(4, 8), torch.randn(4, 8))[0].shape',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Attention weights sum to 1',
        input: 'bool(torch.allclose(scaled_dot_product_attention(torch.randn(4, 8), torch.randn(4, 8), torch.randn(4, 8))[1].sum(dim=-1), torch.ones(4)))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Zero queries attend uniformly: output is the mean of V',
        input: `(lambda: (
            V := torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]),
            bool(torch.allclose(scaled_dot_product_attention(torch.zeros(3, 4), torch.randn(3, 4), V)[0], torch.tensor([[3.0, 4.0]] * 3), atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.scaled_dot_product_attention',
        input: `(lambda: (
            Q := torch.randn(5, 8), K := torch.randn(5, 8), V := torch.randn(5, 3),
            bool(torch.allclose(scaled_dot_product_attention(Q, K, V)[0], torch.nn.functional.scaled_dot_product_attention(Q[None], K[None], V[None])[0], atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Scaling by sqrt(d_k) is applied',
        input: `(lambda: (
            Q := torch.tensor([[2.0, 0.0, 0.0, 0.0]]), K := torch.tensor([[1.0, 0.0, 0.0, 0.0], [0.0, 0.0, 0.0, 0.0]]),
            round(scaled_dot_product_attention(Q, K, torch.randn(2, 2))[1][0, 0].item(), 4)
        )[-1])()`,
        expected: '0.7311',
        hidden: true,
      },
    ],
    hints: [
      'scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)',
      'torch.softmax(scores, dim=-1) normalizes each query row',
      'Return (weights @ V, weights)',
    ],
  },
  'multi-head-attention': {
    note: "Split heads with view/transpose and implement attention yourself. Don't use nn.MultiheadAttention or F.scaled_dot_product_attention.",
    starterCode: `import math
import torch

def multi_head_attention(Q, K, V, num_heads):
    """
    Multi-head attention mechanism (no learned projections).

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
    solution: `import math
import torch

def multi_head_attention(Q, K, V, num_heads):
    seq_len, d_model = Q.shape
    d_k = d_model // num_heads

    # (seq_len, d_model) -> (num_heads, seq_len, d_k)
    def split_heads(x):
        return x.reshape(seq_len, num_heads, d_k).transpose(0, 1)

    Qh, Kh, Vh = split_heads(Q), split_heads(K), split_heads(V)

    # Attention for all heads at once (batched matmul over the head dim)
    scores = Qh @ Kh.transpose(-2, -1) / math.sqrt(d_k)
    attention = torch.softmax(scores, dim=-1)
    heads = attention @ Vh  # (num_heads, seq_len, d_k)

    # Concatenate heads: (num_heads, seq_len, d_k) -> (seq_len, d_model)
    return heads.transpose(0, 1).reshape(seq_len, d_model)
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'multi_head_attention(torch.randn(4, 64), torch.randn(4, 64), torch.randn(4, 64), 8).shape',
        expected: '(4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Zero queries attend uniformly: output rows equal the mean of V',
        input: `(lambda: (
            V := torch.randn(3, 4),
            bool(torch.allclose(multi_head_attention(torch.zeros(3, 4), torch.randn(3, 4), V, 2), V.mean(dim=0).expand(3, 4), atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Matches running attention separately on each head and concatenating',
        input: `(lambda: (
            Q := torch.randn(5, 16), K := torch.randn(5, 16), V := torch.randn(5, 16),
            ref := torch.cat([torch.softmax(Q[:, h * 4:(h + 1) * 4] @ K[:, h * 4:(h + 1) * 4].T / 2.0, dim=-1) @ V[:, h * 4:(h + 1) * 4] for h in range(4)], dim=1),
            bool(torch.allclose(multi_head_attention(Q, K, V, 4), ref, atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'One head equals plain scaled dot-product attention',
        input: `(lambda: (
            Q := torch.randn(4, 8), K := torch.randn(4, 8), V := torch.randn(4, 8),
            bool(torch.allclose(multi_head_attention(Q, K, V, 1), torch.softmax(Q @ K.T / 8 ** 0.5, dim=-1) @ V, atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reshape to (seq_len, num_heads, d_k), then transpose(0, 1) to (num_heads, seq_len, d_k)',
      'Batched matmul handles all heads at once: Qh @ Kh.transpose(-2, -1)',
      'Transpose back and reshape to (seq_len, d_model)',
    ],
  },
  'positional-encoding': {
    note: 'Build the table with torch.arange, torch.exp, torch.sin/cos and strided slice assignment (PE[:, 0::2] = ...).',
    starterCode: `import math
import torch

def positional_encoding(max_len, d_model):
    """
    Generate sinusoidal positional encodings.

    Args:
        max_len: Maximum sequence length
        d_model: Model dimension

    Returns:
        PE: Positional encoding tensor (max_len, d_model)
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def positional_encoding(max_len, d_model):
    PE = torch.zeros(max_len, d_model)

    position = torch.arange(max_len).float().unsqueeze(1)  # (max_len, 1)
    # 1 / 10000^(2i/d_model), computed in log space
    div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))

    PE[:, 0::2] = torch.sin(position * div_term)
    PE[:, 1::2] = torch.cos(position * div_term)
    return PE
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
        description: 'Position 1 = [sin(1), cos(1), sin(0.01), cos(0.01)] for d_model=4',
        input: 'bool(torch.allclose(positional_encoding(10, 4)[1], torch.tensor([0.841471, 0.540302, 0.0099998, 0.99995]), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Position 0 alternates sin(0)=0 and cos(0)=1',
        input: 'positional_encoding(10, 6)[0].tolist()',
        expected: '[0.0, 1.0, 0.0, 1.0, 0.0, 1.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Values for a larger table',
        input: `(lambda: (
            PE := positional_encoding(20, 8),
            bool(abs(PE[7, 2].item() - 0.6442177) < 1e-5 and abs(PE[19, 5].item() - 0.9820042) < 1e-5)
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'position = torch.arange(max_len).float().unsqueeze(1)',
      'div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))',
      'PE[:, 0::2] = torch.sin(position * div_term); PE[:, 1::2] = torch.cos(position * div_term)',
    ],
  },
  'layer-norm': {
    note: "Implement with mean and var(unbiased=False) over the last dim. Don't use F.layer_norm or nn.LayerNorm; a hidden test compares against F.layer_norm.",
    starterCode: `import torch

def layer_norm(X, gamma, beta, eps=1e-5):
    """
    Apply layer normalization over the last dimension.

    Args:
        X: Input (batch, seq_len, features) or (seq_len, features)
        gamma: Scale parameter (features,)
        beta: Shift parameter (features,)
        eps: Small constant

    Returns:
        output: Normalized tensor (same shape as X)
    """
    # Your code here
    pass
`,
    solution: `import torch

def layer_norm(X, gamma, beta, eps=1e-5):
    # Statistics over the feature (last) dimension, per position
    mean = X.mean(dim=-1, keepdim=True)
    var = X.var(dim=-1, keepdim=True, unbiased=False)

    X_norm = (X - mean) / torch.sqrt(var + eps)
    return gamma * X_norm + beta
`,
    testCases: [
      {
        id: '1',
        description: 'Output mean near zero',
        input: 'bool(torch.allclose(layer_norm(torch.tensor([[1.0, 2.0, 3.0, 4.0], [5.0, 6.0, 7.0, 8.0]]), torch.ones(4), torch.zeros(4)).mean(dim=-1), torch.zeros(2), atol=1e-5))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Gamma and beta work',
        input: 'bool(torch.allclose(layer_norm(torch.tensor([[0.0, 0.0, 2.0, 2.0]]), torch.tensor([1.0, 2.0, 1.0, 2.0]), torch.tensor([0.5, 0.0, 0.0, 0.0])), torch.tensor([[-0.5, -2.0, 1.0, 2.0]]), atol=1e-4))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Uses the biased variance (unit variance output)',
        input: 'round(layer_norm(torch.tensor([[1.0, 2.0, 3.0, 4.0]]), torch.ones(4), torch.zeros(4)).var(unbiased=False).item(), 3)',
        expected: '1.0',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches F.layer_norm on a 3-D input',
        input: `(lambda: (
            X := torch.randn(2, 5, 8) * 2 + 1, g := torch.randn(8), b := torch.randn(8),
            bool(torch.allclose(layer_norm(X, g, b), torch.nn.functional.layer_norm(X, (8,), g, b, eps=1e-5), atol=1e-5))
        )[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'X.mean(dim=-1, keepdim=True) and X.var(dim=-1, keepdim=True, unbiased=False)',
      'keepdim=True keeps the shapes broadcastable',
      'Normalize, then gamma * X_norm + beta',
    ],
  },
  'causal-mask': {
    note: 'Use torch.triu / torch.full (or masked_fill). The mask is additive: 0 where attention is allowed, -inf above the diagonal.',
    starterCode: `import torch

def create_causal_mask(seq_len):
    """
    Create a causal attention mask.

    Args:
        seq_len: Sequence length

    Returns:
        mask: Causal mask tensor (seq_len, seq_len)
              0 for allowed positions, -inf for masked
    """
    # Your code here
    pass
`,
    solution: `import torch

def create_causal_mask(seq_len):
    # -inf strictly above the diagonal, 0 on and below it
    return torch.triu(torch.full((seq_len, seq_len), float('-inf')), diagonal=1)
`,
    testCases: [
      {
        id: '1',
        description: 'Correct shape',
        input: 'create_causal_mask(4).shape',
        expected: '(4, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Upper triangle is -inf',
        input: 'torch.isinf(create_causal_mask(3)).tolist()',
        expected: '[[False, True, True], [False, False, True], [False, False, False]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Lower triangle (incl. diagonal) is 0, upper is -inf',
        input: 'bool(torch.allclose(create_causal_mask(3), torch.tensor([[0.0, float("-inf"), float("-inf")], [0.0, 0.0, float("-inf")], [0.0, 0.0, 0.0]])))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'After softmax, row 1 attends equally to positions 0 and 1 only',
        input: 'torch.softmax(create_causal_mask(4), dim=-1)[1].tolist()',
        expected: '[0.5, 0.5, 0.0, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      "torch.full((n, n), float('-inf')) fills a matrix with -inf",
      'torch.triu(x, diagonal=1) keeps only the part strictly above the diagonal (the rest becomes 0)',
      'Alternative: torch.zeros(n, n).masked_fill(torch.ones(n, n).triu(1).bool(), float("-inf"))',
    ],
  },
  // Tracks for existing problems that had no PyTorch track yet.
  'bpe-tokenization': {
    note: 'Tokenizer training is string processing: no tensors are involved, so this track is plain Python.',
    starterCode: `from collections import Counter

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
    solution: `from collections import Counter

def bpe_train(word_freqs, num_merges):
    # Split each word into tokens
    splits = {word: word.split() for word in word_freqs}
    merges = []

    for _ in range(num_merges):
        # Count adjacent pairs, weighted by word frequency
        pair_freqs = Counter()
        for word, freq in word_freqs.items():
            tokens = splits[word]
            for a, b in zip(tokens, tokens[1:]):
                pair_freqs[(a, b)] += freq

        if not pair_freqs:
            break

        best_pair = max(pair_freqs, key=pair_freqs.get)
        merges.append(best_pair)

        # Merge the pair everywhere, scanning left to right
        for word, tokens in splits.items():
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
    testCases: [
      {
        id: '1',
        description: 'First merge is the most frequent pair',
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[0]',
        expected: "('u', 'g')",
        hidden: false,
      },
      {
        id: '2',
        description: 'Number of merges',
        input: 'len(bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3))',
        expected: '3',
        hidden: false,
      },
      {
        id: '3',
        description: 'Second merge uses the merged token',
        input: 'bpe_train({"h u g </w>": 10, "p u g </w>": 5, "b u g </w>": 2}, 3)[1]',
        expected: "('ug', '</w>')",
        hidden: true,
      },
      {
        id: '4',
        description: 'Different corpus',
        input: 'bpe_train({"a b c </w>": 10, "a b </w>": 7, "b c </w>": 3}, 2)[0]',
        expected: "('a', 'b')",
        hidden: true,
      },
      {
        id: '5',
        description: 'Full merge list, stopping when no pairs are left',
        input: 'bpe_train({"l o w </w>": 5, "l o w e r </w>": 2, "n e w </w>": 6}, 20)',
        expected: "[('w', '</w>'), ('l', 'o'), ('n', 'e'), ('ne', 'w</w>'), ('lo', 'w</w>'), ('lo', 'w'), ('low', 'e'), ('lowe', 'r'), ('lower', '</w>')]",
        hidden: true,
      },
    ],
  },
  'rope-embeddings': {
    note: "Implement the rotation with tensor ops (slicing, torch.stack). Complex-number tricks such as torch.view_as_complex aren't supported in the browser.",
    starterCode: `import torch

def apply_rope(Q, K):
    """
    Apply Rotary Positional Embeddings to Q and K.

    Args:
        Q: Queries, tensor (seq_len, d_model) where d_model is even
        K: Keys, tensor (seq_len, d_model)

    Returns:
        Q_rot: Rotated queries (seq_len, d_model)
        K_rot: Rotated keys (seq_len, d_model)
    """
    # Your code here
    pass
`,
    solution: `import torch

def apply_rope(Q, K):
    seq_len, d = Q.shape

    # Angles pos * theta_i, with theta_i = 1 / 10000^(2i / d)
    positions = torch.arange(seq_len).float().unsqueeze(1)  # (seq_len, 1)
    theta = 1.0 / torch.pow(10000.0, torch.arange(0, d, 2).float() / d)  # (d/2,)
    angles = positions * theta  # (seq_len, d/2)
    cos, sin = torch.cos(angles), torch.sin(angles)

    def rotate(x):
        x_even, x_odd = x[:, 0::2], x[:, 1::2]
        # Rotate each (even, odd) pair, then interleave the pairs back
        rotated = torch.stack([x_even * cos - x_odd * sin,
                               x_even * sin + x_odd * cos], dim=-1)
        return rotated.flatten(1)

    return rotate(Q), rotate(K)
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape',
        input: 'tuple(apply_rope(torch.ones(4, 8), torch.ones(4, 8))[0].shape)',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Position 0 is not rotated',
        input: 'apply_rope(torch.tensor([[1.0, 2.0, 3.0, 4.0]]), torch.ones(1, 4))[0].tolist()',
        expected: '[[1.0, 2.0, 3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Rotation preserves vector norms',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(6, 8)).float(),
    Q_rot := apply_rope(Q, Q)[0],
    bool(torch.allclose(Q_rot.norm(dim=-1), Q.norm(dim=-1), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Hand-computed rotation at position 1 (d=2, theta=1)',
        input: '[round(v, 4) for v in apply_rope(torch.ones(2, 2), torch.ones(2, 2))[0][1].tolist()]',
        expected: '[-0.3012, 1.3818]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Per-pair frequencies at position 3 (d=4)',
        input: '[round(v, 4) for v in apply_rope(torch.ones(4, 4), torch.zeros(4, 4))[0][3].tolist()]',
        expected: '[-1.1311, -0.8489, 0.9696, 1.0295]',
        hidden: true,
      },
      {
        id: '6',
        description: 'K gets the same rotation as Q',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(5, 6)).float(),
    K := torch.from_numpy(np.random.randn(5, 6)).float(),
    out := apply_rope(Q, K),
    bool(torch.allclose(out[1], apply_rope(K, Q)[0], atol=1e-6) and not torch.allclose(out[1][1:], K[1:]))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'q.k depends only on the relative position',
        input: `(lambda: (
    q := torch.from_numpy(np.random.randn(1, 8)).float().repeat(6, 1),
    k := torch.from_numpy(np.random.randn(1, 8)).float().repeat(6, 1),
    out := apply_rope(q, k),
    bool(torch.allclose((out[0][4] * out[1][1]).sum(), (out[0][5] * out[1][2]).sum(), atol=1e-4))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'theta = 1.0 / torch.pow(10000.0, torch.arange(0, d, 2).float() / d); angles = positions[:, None] * theta',
      'Split the pairs with x[:, 0::2] and x[:, 1::2]',
      'Rotate: (even*cos - odd*sin, even*sin + odd*cos), then torch.stack(..., dim=-1).flatten(1) to interleave',
    ],
  },
  'grouped-query-attention': {
    note: "Implement the attention with tensor ops. Don't use F.scaled_dot_product_attention (or its enable_gqa flag) or nn.MultiheadAttention.",
    starterCode: `import math
import torch
import torch.nn.functional as F

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    """
    Grouped Query Attention.

    Args:
        Q: Queries, tensor (seq_len, num_q_heads * d_head)
        K: Keys, tensor (seq_len, num_kv_heads * d_head)
        V: Values, tensor (seq_len, num_kv_heads * d_head)
        num_q_heads: Number of query heads
        num_kv_heads: Number of key/value heads (divides num_q_heads)

    Returns:
        output: tensor (seq_len, num_q_heads * d_head)
    """
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def grouped_query_attention(Q, K, V, num_q_heads, num_kv_heads):
    seq_len = Q.shape[0]
    d_head = Q.shape[1] // num_q_heads
    group_size = num_q_heads // num_kv_heads

    # Per-head layout: (num_heads, seq_len, d_head)
    q = Q.reshape(seq_len, num_q_heads, d_head).transpose(0, 1)
    k = K.reshape(seq_len, num_kv_heads, d_head).transpose(0, 1)
    v = V.reshape(seq_len, num_kv_heads, d_head).transpose(0, 1)

    # Each KV head serves group_size consecutive query heads
    k = k.repeat_interleave(group_size, dim=0)
    v = v.repeat_interleave(group_size, dim=0)

    # Scaled dot-product attention per head
    scores = q @ k.transpose(-2, -1) / math.sqrt(d_head)
    heads = F.softmax(scores, dim=-1) @ v  # (num_q_heads, seq_len, d_head)

    # Concatenate heads
    return heads.transpose(0, 1).reshape(seq_len, -1)
`,
    testCases: [
      {
        id: '1',
        description: 'GQA output shape (8 query heads, 2 KV heads)',
        input: 'tuple(grouped_query_attention(torch.from_numpy(np.random.randn(4, 64)).float(), torch.from_numpy(np.random.randn(4, 16)).float(), torch.from_numpy(np.random.randn(4, 16)).float(), 8, 2).shape)',
        expected: '(4, 64)',
        hidden: false,
      },
      {
        id: '2',
        description: 'MQA output shape (1 KV head)',
        input: 'tuple(grouped_query_attention(torch.from_numpy(np.random.randn(4, 32)).float(), torch.from_numpy(np.random.randn(4, 4)).float(), torch.from_numpy(np.random.randn(4, 4)).float(), 8, 1).shape)',
        expected: '(4, 32)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Single token: each query head returns its group\'s value head',
        input: 'grouped_query_attention(torch.from_numpy(np.random.randn(1, 8)).float(), torch.from_numpy(np.random.randn(1, 4)).float(), torch.tensor([[1.0, 2.0, 3.0, 4.0]]), 4, 2).tolist()',
        expected: '[[1.0, 2.0, 1.0, 2.0, 3.0, 4.0, 3.0, 4.0]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Matches reference attention with repeated KV heads',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(5, 24)).float(),
    K := torch.from_numpy(np.random.randn(5, 8)).float(),
    V := torch.from_numpy(np.random.randn(5, 8)).float(),
    q := Q.reshape(5, 6, 4).transpose(0, 1),
    k := K.reshape(5, 2, 4).transpose(0, 1).repeat_interleave(3, dim=0),
    v := V.reshape(5, 2, 4).transpose(0, 1).repeat_interleave(3, dim=0),
    ref := torch.nn.functional.scaled_dot_product_attention(q, k, v).transpose(0, 1).reshape(5, 24),
    bool(torch.allclose(grouped_query_attention(Q, K, V, 6, 2), ref, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'MHA case (num_kv_heads == num_q_heads) values',
        input: '[round(v, 4) for v in grouped_query_attention(torch.tensor([[1.0, 0.0], [0.0, 1.0]]), torch.tensor([[1.0, 0.0], [0.0, 1.0]]), torch.tensor([[1.0, 2.0], [3.0, 4.0]]), 2, 2).flatten().tolist()]',
        expected: '[1.5379, 3.0, 2.0, 3.4621]',
        hidden: true,
      },
    ],
    hints: [
      'Reshape Q to (seq_len, num_q_heads, d_head) and .transpose(0, 1) to put heads first; same for K, V with num_kv_heads',
      'k.repeat_interleave(group_size, dim=0) gives query head h the KV head h // group_size',
      'F.softmax(q @ k.transpose(-2, -1) / math.sqrt(d_head), dim=-1) @ v',
      'Transpose back and reshape to (seq_len, num_q_heads * d_head)',
    ],
  },
  'sliding-window-attention': {
    starterCode: `import torch

def sliding_window_mask(seq_len, window_size):
    """
    Create a sliding window causal attention mask.

    Args:
        seq_len: Sequence length
        window_size: Number of tokens each position can attend to
                     (including itself)

    Returns:
        mask: float tensor (seq_len, seq_len) with 0 for allowed, -inf for masked
    """
    # Your code here
    pass
`,
    solution: `import torch

def sliding_window_mask(seq_len, window_size):
    rows = torch.arange(seq_len).unsqueeze(1)  # (seq_len, 1)
    cols = torch.arange(seq_len).unsqueeze(0)  # (1, seq_len)

    # Causal (no future tokens) and within the window
    allowed = (cols <= rows) & (rows - cols < window_size)

    return torch.zeros(seq_len, seq_len).masked_fill(~allowed, float('-inf'))
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape',
        input: 'tuple(sliding_window_mask(6, 3).shape)',
        expected: '(6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Outside the window is masked',
        input: 'bool(sliding_window_mask(4, 2)[2, 0] == float("-inf"))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Inside the window is allowed',
        input: 'bool(sliding_window_mask(4, 2)[2, 1] == 0.0)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Window larger than the sequence is a plain causal mask',
        input: 'bool(torch.equal(sliding_window_mask(4, 10), torch.zeros(4, 4).masked_fill(torch.triu(torch.ones(4, 4), diagonal=1).bool(), float("-inf"))))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Window 1 allows only the diagonal',
        input: '(sliding_window_mask(4, 1) == 0).int().tolist()',
        expected: '[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Full pattern for seq_len=5, window=3',
        input: '(sliding_window_mask(5, 3) == 0).int().tolist()',
        expected: '[[1, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 0, 0], [0, 1, 1, 1, 0], [0, 0, 1, 1, 1]]',
        hidden: true,
      },
    ],
    hints: [
      'rows = torch.arange(seq_len).unsqueeze(1), cols = torch.arange(seq_len).unsqueeze(0)',
      'allowed = (cols <= rows) & (rows - cols < window_size)',
      'torch.zeros(seq_len, seq_len).masked_fill(~allowed, float("-inf"))',
    ],
  },
  'attention-backward': {
    note: "Compute the gradients by hand with tensor ops: don't call .backward() or torch.autograd in your solution (the hidden tests use autograd as the reference), and don't use F.scaled_dot_product_attention.",
    starterCode: `import math
import torch

def attention_forward(Q, K, V, causal=False):
    """
    Scaled dot-product attention.

    Args:
        Q: Queries (n, d)
        K: Keys (m, d)
        V: Values (m, d_v)
        causal: If True, query i may only attend to keys j <= i (n == m)

    Returns:
        Out: tensor (n, d_v)
    """
    # Your code here
    pass

def attention_backward(Q, K, V, dOut, causal=False):
    """
    Gradients of attention with respect to Q, K and V, computed by hand.

    Args:
        Q, K, V: As in attention_forward
        dOut: Upstream gradient dL/dOut, tensor (n, d_v)
        causal: Same flag as in the forward pass

    Returns:
        (dQ, dK, dV) tensors with the shapes of Q, K, V
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def _probs(Q, K, causal):
    d = Q.shape[-1]
    S = Q @ K.T / math.sqrt(d)
    if causal:
        n, m = S.shape
        future = torch.triu(torch.ones(n, m), diagonal=1).bool()
        S = S.masked_fill(future, float('-inf'))
    S = S - S.max(dim=-1, keepdim=True).values
    P = torch.exp(S)
    return P / P.sum(dim=-1, keepdim=True)

def attention_forward(Q, K, V, causal=False):
    return _probs(Q, K, causal) @ V

def attention_backward(Q, K, V, dOut, causal=False):
    d = Q.shape[-1]
    P = _probs(Q, K, causal)                            # (n, m)
    dV = P.T @ dOut                                     # (m, d_v)
    dP = dOut @ V.T                                     # (n, m)
    dS = P * (dP - (dP * P).sum(dim=-1, keepdim=True))
    dQ = dS @ K / math.sqrt(d)                          # (n, d)
    dK = dS.T @ Q / math.sqrt(d)                        # (m, d)
    return dQ, dK, dV
`,
    testCases: [
      {
        id: '1',
        description: 'Forward: uniform attention averages V',
        input: 'attention_forward(torch.zeros((2, 4)), torch.zeros((3, 4)), torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]])).tolist()',
        expected: '[[3.0, 4.0], [3.0, 4.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'dV for uniform attention',
        input: '[[round(v, 4) for v in row] for row in attention_backward(torch.zeros((2, 4)), torch.zeros((3, 4)), torch.tensor([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]]), torch.ones((2, 2)))[2].tolist()]',
        expected: '[[0.6667, 0.6667], [0.6667, 0.6667], [0.6667, 0.6667]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gradient shapes',
        input: 'tuple(tuple(g.shape) for g in attention_backward(torch.from_numpy(np.random.randn(3, 4)).float(), torch.from_numpy(np.random.randn(5, 4)).float(), torch.from_numpy(np.random.randn(5, 2)).float(), torch.from_numpy(np.random.randn(3, 2)).float()))',
        expected: '((3, 4), (5, 4), (5, 2))',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches autograd (n != m)',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(3, 4)).float().requires_grad_(),
    K := torch.from_numpy(np.random.randn(5, 4)).float().requires_grad_(),
    V := torch.from_numpy(np.random.randn(5, 2)).float().requires_grad_(),
    G := torch.from_numpy(np.random.randn(3, 2)).float(),
    out := torch.nn.functional.softmax(Q @ K.T / 2.0, dim=-1) @ V,
    _ := out.backward(G),
    grads := attention_backward(Q.detach(), K.detach(), V.detach(), G),
    bool(torch.allclose(grads[0], Q.grad, atol=1e-5)
         and torch.allclose(grads[1], K.grad, atol=1e-5)
         and torch.allclose(grads[2], V.grad, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Matches autograd with a causal mask',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(4, 4)).float().requires_grad_(),
    K := torch.from_numpy(np.random.randn(4, 4)).float().requires_grad_(),
    V := torch.from_numpy(np.random.randn(4, 3)).float().requires_grad_(),
    G := torch.from_numpy(np.random.randn(4, 3)).float(),
    S := (Q @ K.T / 2.0).masked_fill(torch.triu(torch.ones(4, 4), diagonal=1).bool(), float('-inf')),
    out := torch.nn.functional.softmax(S, dim=-1) @ V,
    _ := out.backward(G),
    grads := attention_backward(Q.detach(), K.detach(), V.detach(), G, causal=True),
    bool(torch.allclose(grads[0], Q.grad, atol=1e-5)
         and torch.allclose(grads[1], K.grad, atol=1e-5)
         and torch.allclose(grads[2], V.grad, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Causal: the first query only sees the first key',
        input: '(lambda: (Q := torch.from_numpy(np.random.randn(4, 4)).float(), V := torch.from_numpy(np.random.randn(4, 3)).float(), bool(torch.allclose(attention_forward(Q, torch.from_numpy(np.random.randn(4, 4)).float(), V, causal=True)[0], V[0], atol=1e-6)))[-1])()',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Exact gradient values',
        input: '(lambda: (Q := torch.from_numpy(np.random.randn(2, 4)).float(), K := torch.from_numpy(np.random.randn(3, 4)).float(), V := torch.from_numpy(np.random.randn(3, 2)).float(), G := torch.from_numpy(np.random.randn(2, 2)).float(), [[[round(v, 3) for v in row] for row in g.tolist()] for g in attention_backward(Q, K, V, G)])[-1])()',
        expected: '[[[0.073, -0.027, 0.014, -0.101], [0.287, -0.113, 0.018, -0.422]], [[-0.389, 0.124, -0.203, -0.111], [-0.059, 0.072, -0.027, 0.079], [0.447, -0.196, 0.23, 0.032]], [[0.151, 0.027], [0.43, 0.333], [0.998, 0.921]]]',
        hidden: true,
      },
      {
        id: '8',
        description: 'Large scores stay finite (stable softmax)',
        input: 'bool(all(not (torch.isnan(g).any().item() or torch.isinf(g).any().item()) for g in attention_backward(torch.from_numpy(np.random.randn(3, 4)).float() * 100, torch.from_numpy(np.random.randn(3, 4)).float() * 100, torch.from_numpy(np.random.randn(3, 2)).float(), torch.from_numpy(np.random.randn(3, 2)).float())))',
        expected: 'True',
        hidden: true,
      },
    ],
  },
  'longest-match-tokenizer': {
    note: 'Tokenization is string processing: no tensors are involved, so this track is plain Python with the same function as the NumPy track.',
    starterCode: `def tokenize(text, vocab, unk_token='[UNK]', wordpiece=False):
    """
    Greedy longest-match (maximal munch) tokenization.

    Args:
        text: Input string
        vocab: Dict mapping token string -> id (contains unk_token)
        unk_token: Token used for text that no vocabulary entry matches
        wordpiece: If True, split on whitespace and look up non-initial
                   pieces of a word with a '##' prefix

    Returns:
        List of token ids
    """
    # Your code here
    pass
`,
    solution: `def tokenize(text, vocab, unk_token='[UNK]', wordpiece=False):
    unk_id = vocab[unk_token]
    ids = []

    if not wordpiece:
        max_len = max(len(token) for token in vocab)
        i = 0
        while i < len(text):
            # Try the longest candidate first
            for length in range(min(max_len, len(text) - i), 0, -1):
                piece = text[i:i + length]
                if piece in vocab:
                    ids.append(vocab[piece])
                    i += length
                    break
            else:
                ids.append(unk_id)  # no token starts here: one [UNK] per character
                i += 1
        return ids

    # WordPiece: split on whitespace, '##' marks pieces that continue a word
    for word in text.split():
        pieces = []
        i = 0
        while i < len(word):
            for end in range(len(word), i, -1):
                piece = word[i:end] if i == 0 else '##' + word[i:end]
                if piece in vocab:
                    pieces.append(vocab[piece])
                    i = end
                    break
            else:
                pieces = [unk_id]  # the whole word becomes one [UNK]
                break
        ids.extend(pieces)
    return ids
`,
    testCases: [
      {
        id: '1',
        description: 'Longest match wins',
        input: 'tokenize("abcab", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[4, 3]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Unknown character falls back to [UNK]',
        input: 'tokenize("abxc", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[3, 0, 5]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Spaces are ordinary characters',
        input: 'tokenize("the cab", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[8, 7, 5, 3]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Greedy, not globally optimal',
        input: 'tokenize("abcd", {\'[UNK]\': 0, \'ab\': 1, \'abc\': 2, \'cd\': 3, \'d\': 4, \'a\': 5, \'b\': 6, \'c\': 7})',
        expected: '[2, 4]',
        hidden: true,
      },
      {
        id: '5',
        description: 'One [UNK] per unknown character',
        input: 'tokenize("xyz", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[0, 0, 0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Empty string',
        input: 'tokenize("", {\'[UNK]\': 0, \'a\': 1, \'b\': 2, \'ab\': 3, \'abc\': 4, \'c\': 5, \'bc\': 6, \' \': 7, \'the\': 8, \'th\': 9, \'t\': 10, \'h\': 11, \'e\': 12})',
        expected: '[]',
        hidden: true,
      },
      {
        id: '7',
        description: 'Custom unknown token',
        input: 'tokenize("aXa", {\'<unk>\': 5, \'a\': 1}, unk_token=\'<unk>\')',
        expected: '[1, 5, 1]',
        hidden: true,
      },
      {
        id: '8',
        description: 'WordPiece with ## continuations',
        input: 'tokenize("unaffable playing plays", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        expected: '[1, 2, 3, 4, 5, 4, 6]',
        hidden: true,
      },
      {
        id: '9',
        description: 'WordPiece: an unmatched word becomes a single [UNK]',
        input: 'tokenize("playx un aaa", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        expected: '[0, 1, 9, 10, 10]',
        hidden: true,
      },
      {
        id: '10',
        description: 'WordPiece ignores extra whitespace',
        input: 'tokenize("  play   un  ", {\'[UNK]\': 0, \'un\': 1, \'##aff\': 2, \'##able\': 3, \'play\': 4, \'##ing\': 5, \'##s\': 6, \'u\': 7, \'##n\': 8, \'a\': 9, \'##a\': 10}, wordpiece=True)',
        expected: '[4, 1]',
        hidden: true,
      },
    ],
  },
};
