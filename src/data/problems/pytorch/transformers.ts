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
};
