import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../llm-generation.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const llmGenerationPyTorch: Record<string, LanguageVariant> = {
  // Tracks for existing problems that had no PyTorch track yet.
  'llm-temperature-scaling': {
    note: 'F.softmax is fine here: the point is where the temperature goes.',
    starterCode: `import torch
import torch.nn.functional as F

def temperature_scaling(logits, temperature=1.0):
    """
    Apply temperature scaling to logits and return probabilities.

    Args:
        logits: Raw logits from the model, tensor (vocab_size,)
        temperature: Temperature parameter (T > 0)

    Returns:
        probs: Probability distribution over vocabulary, tensor (vocab_size,)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def temperature_scaling(logits, temperature=1.0):
    # Divide the logits by T, then softmax (F.softmax subtracts the max for stability)
    return F.softmax(logits / temperature, dim=-1)
`,
    testCases: [
      {
        id: '1',
        description: 'T=1 is a plain softmax',
        input: `(lambda: (
    logits := torch.tensor([2.0, 1.0, 0.1]),
    probs := temperature_scaling(logits, 1.0),
    bool(torch.allclose(probs, torch.exp(logits) / torch.exp(logits).sum(), atol=1e-4))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'Lower temperature is sharper',
        input: `(lambda: (
    logits := torch.tensor([2.0, 1.0, 0.1]),
    probs_low := temperature_scaling(logits, 0.5),
    probs_high := temperature_scaling(logits, 2.0),
    bool(probs_low.max() > probs_high.max())
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Probabilities sum to 1',
        input: 'round(temperature_scaling(torch.tensor([1.0, 2.0, 3.0, 4.0]), 0.7).sum().item(), 4)',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '4',
        description: 'Very low temperature approaches argmax',
        input: 'bool(temperature_scaling(torch.tensor([3.0, 1.0, 0.5]), 0.01)[0] > 0.99)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Values at T=2',
        input: '[round(v, 4) for v in temperature_scaling(torch.tensor([2.0, 1.0, 0.1]), 2.0).tolist()]',
        expected: '[0.5017, 0.3043, 0.194]',
        hidden: true,
      },
    ],
    hints: [
      'Divide the logits by the temperature before the softmax',
      'F.softmax(scaled, dim=-1) is numerically stable',
    ],
  },

  'llm-top-k-sampling': {
    note: 'Use torch.topk to find the top tokens and torch.multinomial to sample. Keep the torch.manual_seed(42) line.',
    starterCode: `import torch
import torch.nn.functional as F

def top_k_sampling(logits, k, temperature=1.0):
    """
    Sample from the top-k most likely tokens.

    Args:
        logits: Raw logits, tensor (vocab_size,)
        k: Number of top tokens to keep
        temperature: Temperature for scaling (applied before filtering)

    Returns:
        token: Sampled token index (Python int)
        filtered_probs: Probability distribution after filtering, tensor (vocab_size,)
    """
    torch.manual_seed(42)
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def top_k_sampling(logits, k, temperature=1.0):
    torch.manual_seed(42)
    scaled = logits / temperature

    # Keep the k largest logits, set the rest to -inf
    top_vals, top_idx = torch.topk(scaled, k)
    filtered = torch.full_like(scaled, float('-inf'))
    filtered[top_idx] = top_vals

    # Softmax renormalizes over the kept tokens (exp(-inf) = 0)
    probs = F.softmax(filtered, dim=-1)

    token = torch.multinomial(probs, num_samples=1).item()
    return int(token), probs
`,
    testCases: [
      {
        id: '1',
        description: 'Exactly k tokens keep probability',
        input: 'int((top_k_sampling(torch.tensor([5.0, 3.0, 2.0, 1.0, 0.1]), 3)[1] > 0).sum())',
        expected: '3',
        hidden: false,
      },
      {
        id: '2',
        description: 'Filtered probabilities sum to 1',
        input: 'round(top_k_sampling(torch.tensor([5.0, 3.0, 2.0, 1.0, 0.1]), 3)[1].sum().item(), 4)',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Sampled token is one of the top k',
        input: `(lambda: (
    logits := torch.tensor([5.0, 3.0, 2.0, 1.0, 0.1]),
    result := top_k_sampling(logits, 3),
    result[0] in torch.topk(logits, 3).indices.tolist()
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'k=1 is greedy',
        input: 'top_k_sampling(torch.tensor([1.0, 5.0, 2.0, 0.5]), 1)[0]',
        expected: '1',
        hidden: true,
      },
      {
        id: '5',
        description: 'Filtered distribution values (k=2)',
        input: '[round(v, 4) for v in top_k_sampling(torch.tensor([1.0, 5.0, 2.0, 0.5]), 2)[1].tolist()]',
        expected: '[0.0, 0.9526, 0.0474, 0.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Temperature is applied before filtering (k=3, T=2)',
        input: '[round(v, 4) for v in top_k_sampling(torch.tensor([2.0, 0.0, 4.0, 1.0, -1.0]), 3, 2.0)[1].tolist()]',
        expected: '[0.2312, 0.0, 0.6285, 0.1402, 0.0]',
        hidden: true,
      },
    ],
    hints: [
      'Scale first: scaled = logits / temperature',
      'top_vals, top_idx = torch.topk(scaled, k); build torch.full_like(scaled, float("-inf")) and write the top values back at top_idx',
      'F.softmax over the filtered logits renormalizes automatically',
      'torch.multinomial(probs, num_samples=1).item() samples a token',
    ],
  },

  'llm-top-p-sampling': {
    note: 'Use torch.sort and torch.cumsum to find the nucleus and torch.multinomial to sample. Keep the torch.manual_seed(42) line.',
    starterCode: `import torch
import torch.nn.functional as F

def top_p_sampling(logits, p, temperature=1.0):
    """
    Nucleus (top-p) sampling from logits.

    Args:
        logits: Raw logits, tensor (vocab_size,)
        p: Cumulative probability threshold (0 < p <= 1)
        temperature: Temperature for scaling

    Returns:
        token: Sampled token index (Python int)
        filtered_probs: Probability distribution after filtering, tensor (vocab_size,)
    """
    torch.manual_seed(42)
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def top_p_sampling(logits, p, temperature=1.0):
    torch.manual_seed(42)
    probs = F.softmax(logits / temperature, dim=-1)

    # Sort descending and accumulate
    sorted_probs, sorted_idx = torch.sort(probs, descending=True)
    cumsum = torch.cumsum(sorted_probs, dim=-1)

    # Keep a token while the mass before it is still below p,
    # which includes the token that crosses the threshold
    keep = (cumsum - sorted_probs) < p
    kept_idx = sorted_idx[keep]

    filtered = torch.zeros_like(probs)
    filtered[kept_idx] = probs[kept_idx]
    filtered = filtered / filtered.sum()

    token = torch.multinomial(filtered, num_samples=1).item()
    return int(token), filtered
`,
    testCases: [
      {
        id: '1',
        description: 'Filtered probabilities sum to 1',
        input: 'round(top_p_sampling(torch.tensor([5.0, 3.0, 2.0, 1.0, 0.1]), 0.9)[1].sum().item(), 4)',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'p=1.0 keeps every token',
        input: 'int((top_p_sampling(torch.tensor([5.0, 3.0, 2.0, 1.0, 0.1]), 1.0)[1] > 0).sum())',
        expected: '5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Smaller p keeps no more tokens than larger p',
        input: `(lambda: (
    logits := torch.tensor([5.0, 3.0, 2.0, 1.0, 0.1]),
    small := top_p_sampling(logits, 0.5),
    large := top_p_sampling(logits, 0.95),
    bool((small[1] > 0).sum() <= (large[1] > 0).sum())
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Confident distribution keeps few tokens',
        input: 'int((top_p_sampling(torch.tensor([10.0, 1.0, 0.5, 0.1]), 0.5)[1] > 0).sum())',
        expected: '1',
        hidden: true,
      },
      {
        id: '5',
        description: 'Nucleus includes the token that crosses p',
        input: '[round(v, 4) for v in top_p_sampling(torch.tensor([2.0, 1.0, 0.5, 0.1, -1.0]), 0.8)[1].tolist()]',
        expected: '[0.6285, 0.2312, 0.1402, 0.0, 0.0]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Sampled token lies in the nucleus',
        input: `(lambda: (
    result := top_p_sampling(torch.tensor([0.5, 3.0, 2.5, -1.0, 0.0]), 0.7, 1.5),
    bool(result[1][result[0]] > 0)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'probs = F.softmax(logits / temperature, dim=-1)',
      'sorted_probs, sorted_idx = torch.sort(probs, descending=True); cumsum = torch.cumsum(sorted_probs, dim=-1)',
      'A token is in the nucleus if the cumulative mass before it, cumsum - sorted_probs, is still < p',
      'Zero the rest, renormalize, then torch.multinomial(filtered, 1).item()',
    ],
  },

  'llm-repetition-penalty': {
    starterCode: `import torch

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    """
    Apply repetition penalty to logits for previously generated tokens.

    Args:
        logits: Raw logits, tensor (vocab_size,)
        generated_tokens: List of previously generated token indices
        penalty: Repetition penalty factor (>= 1.0)

    Returns:
        penalized_logits: New tensor with the penalty applied (vocab_size,);
                          the input tensor must not be modified
    """
    # Your code here
    pass
`,
    solution: `import torch

def apply_repetition_penalty(logits, generated_tokens, penalty=1.2):
    logits = logits.clone()  # don't modify the caller's tensor

    for token_id in generated_tokens:
        if logits[token_id] > 0:
            logits[token_id] = logits[token_id] / penalty
        else:
            logits[token_id] = logits[token_id] * penalty

    return logits
`,
    testCases: [
      {
        id: '1',
        description: 'Positive logit is divided',
        input: 'round(apply_repetition_penalty(torch.tensor([2.0, 1.0, 3.0]), [0], 1.5)[0].item(), 4)',
        expected: '1.3333',
        hidden: false,
      },
      {
        id: '2',
        description: 'Negative logit is multiplied',
        input: 'round(apply_repetition_penalty(torch.tensor([2.0, -1.0, 3.0]), [1], 1.5)[1].item(), 4)',
        expected: '-1.5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Other tokens are unchanged',
        input: 'apply_repetition_penalty(torch.tensor([2.0, -1.0, 3.0]), [0], 1.5)[1:].tolist()',
        expected: '[-1.0, 3.0]',
        hidden: false,
      },
      {
        id: '4',
        description: 'penalty=1.0 has no effect',
        input: `(lambda: (
    logits := torch.tensor([2.0, -1.0, 3.0, 0.5]),
    bool(torch.allclose(apply_repetition_penalty(logits, [0, 1, 2], 1.0), logits))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Several penalized tokens',
        input: 'apply_repetition_penalty(torch.tensor([2.0, -1.0, 3.0, 0.5]), [0, 1, 3], 2.0).tolist()',
        expected: '[1.0, -2.0, 3.0, 0.25]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Input tensor is not modified',
        input: `(lambda: (
    logits := torch.tensor([2.0, -1.0, 3.0]),
    out := apply_repetition_penalty(logits, [0, 1], 2.0),
    logits.tolist() + out.tolist()
)[-1])()`,
        expected: '[2.0, -1.0, 3.0, 1.0, -2.0, 3.0]',
        hidden: true,
      },
    ],
    hints: [
      'Start with logits = logits.clone() so the caller\'s tensor is untouched',
      'Loop over generated_tokens and check logits[token_id] > 0',
      'Positive: divide by penalty; otherwise multiply by penalty',
    ],
  },

  'llm-kv-cache': {
    note: "Implement the attention with tensor ops. Don't use F.scaled_dot_product_attention or nn.MultiheadAttention.",
    starterCode: `import math
import torch
import torch.nn.functional as F

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    """
    Compute attention with KV caching for efficient autoregressive generation.

    Args:
        x_new: New token embedding, tensor (1, d_model)
        W_Q: Query weight matrix (d_model, d_k)
        W_K: Key weight matrix (d_model, d_k)
        W_V: Value weight matrix (d_model, d_v)
        k_cache: Cached keys from previous steps (seq_len, d_k) or None
        v_cache: Cached values from previous steps (seq_len, d_v) or None

    Returns:
        output: Attention output for new token (1, d_v)
        k_cache: Updated key cache (seq_len+1, d_k)
        v_cache: Updated value cache (seq_len+1, d_v)
    """
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def kv_cache_attention(x_new, W_Q, W_K, W_V, k_cache=None, v_cache=None):
    # Project only the new token
    q = x_new @ W_Q  # (1, d_k)
    k = x_new @ W_K  # (1, d_k)
    v = x_new @ W_V  # (1, d_v)

    # Append to the cache
    if k_cache is None:
        k_cache, v_cache = k, v
    else:
        k_cache = torch.cat([k_cache, k], dim=0)
        v_cache = torch.cat([v_cache, v], dim=0)

    # The new query attends to every cached position
    scores = q @ k_cache.T / math.sqrt(q.shape[-1])  # (1, seq_len)
    weights = F.softmax(scores, dim=-1)
    output = weights @ v_cache  # (1, d_v)

    return output, k_cache, v_cache
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(1, 8)).float(),
    W_Q := torch.from_numpy(np.random.randn(8, 4) * 0.1).float(),
    W_K := torch.from_numpy(np.random.randn(8, 4) * 0.1).float(),
    W_V := torch.from_numpy(np.random.randn(8, 4) * 0.1).float(),
    tuple(kv_cache_attention(x, W_Q, W_K, W_V)[0].shape)
)[-1])()`,
        expected: '(1, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Cache grows by one per step',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(1, 4)).float(),
    W := torch.from_numpy(np.random.randn(4, 4) * 0.1).float(),
    r1 := kv_cache_attention(x, W, W, W),
    r2 := kv_cache_attention(x, W, W, W, r1[1], r1[2]),
    r3 := kv_cache_attention(x, W, W, W, r2[1], r2[2]),
    (r1[1].shape[0], r3[1].shape[0], r3[2].shape[0])
)[-1])()`,
        expected: '(1, 3, 3)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Cached decoding matches full attention for the last token',
        input: `(lambda: (
    X := torch.from_numpy(np.random.randn(3, 4)).float(),
    W := torch.from_numpy(np.random.randn(3, 4, 4)).float(),
    r1 := kv_cache_attention(X[0:1], W[0], W[1], W[2]),
    r2 := kv_cache_attention(X[1:2], W[0], W[1], W[2], r1[1], r1[2]),
    r3 := kv_cache_attention(X[2:3], W[0], W[1], W[2], r2[1], r2[2]),
    ref := torch.nn.functional.softmax((X[2:3] @ W[0]) @ (X @ W[1]).T / 2.0, dim=-1) @ (X @ W[2]),
    bool(torch.allclose(r3[0], ref, atol=1e-5) and torch.allclose(r3[1], X @ W[1], atol=1e-5) and torch.allclose(r3[2], X @ W[2], atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Hand-computed second step with identity weights',
        input: `(lambda: (
    I := torch.eye(2),
    r1 := kv_cache_attention(torch.tensor([[1.0, 0.0]]), I, I, I),
    r2 := kv_cache_attention(torch.tensor([[0.0, 1.0]]), I, I, I, r1[1], r1[2]),
    [round(v, 4) for v in r1[0][0].tolist() + r2[0][0].tolist()]
)[-1])()`,
        expected: '[1.0, 0.0, 0.3302, 0.6698]',
        hidden: true,
      },
    ],
    hints: [
      'Project only the new token: q = x_new @ W_Q, and likewise k, v',
      'If the cache is None, start it with k and v; otherwise torch.cat([k_cache, k], dim=0)',
      'scores = q @ k_cache.T / math.sqrt(d_k); output = F.softmax(scores, dim=-1) @ v_cache',
    ],
  },

  'llm-beam-search': {
    note: 'Use torch.topk to keep the best candidates at each step.',
    starterCode: `import torch

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    """
    Beam search decoding over pre-computed log probabilities.

    Args:
        log_probs: Log probability tensor (num_steps, vocab_size).
                   log_probs[t] gives log probs for step t.
        beam_width: Number of beams to maintain
        max_length: Maximum sequence length (defaults to num_steps)
        eos_token: End-of-sequence token ID (optional)

    Returns:
        best_sequence: List of token indices (Python ints) for the best beam
        best_score: Total log-probability of the best sequence (Python float, rounded to 4 dp)
    """
    # Your code here
    pass
`,
    solution: `import torch

def beam_search(log_probs, beam_width, max_length=None, eos_token=None):
    num_steps, vocab_size = log_probs.shape
    if max_length is None:
        max_length = num_steps

    beams = [([], torch.tensor(0.0))]  # (sequence, score)

    for step in range(min(max_length, num_steps)):
        cand_seqs, cand_scores = [], []
        for seq, score in beams:
            # A finished beam is carried forward unchanged
            if eos_token is not None and seq and seq[-1] == eos_token:
                cand_seqs.append(seq)
                cand_scores.append(score.reshape(1))
                continue
            # Expand with every token at once: score + log_probs[step]
            cand_seqs.extend(seq + [token] for token in range(vocab_size))
            cand_scores.append(score + log_probs[step])

        scores = torch.cat(cand_scores)
        top_scores, top_idx = torch.topk(scores, min(beam_width, scores.numel()))
        beams = [(cand_seqs[i], s) for i, s in zip(top_idx.tolist(), top_scores)]

    best_seq, best_score = beams[0]  # topk returns scores in descending order
    return best_seq, round(best_score.item(), 4)
`,
    testCases: [
      {
        id: '1',
        description: 'Greedy (beam 1) sequence',
        input: 'beam_search(torch.log(torch.tensor([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])), 1)[0]',
        expected: '[0, 1, 2]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Greedy (beam 1) score',
        input: 'beam_search(torch.log(torch.tensor([[0.6, 0.3, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])), 1)[1]',
        expected: '-1.3783',
        hidden: false,
      },
      {
        id: '3',
        description: 'Sequence length equals the number of steps',
        input: 'len(beam_search(torch.log(torch.tensor([[0.5, 0.5], [0.3, 0.7], [0.8, 0.2], [0.4, 0.6]])), 2)[0])',
        expected: '4',
        hidden: false,
      },
      {
        id: '4',
        description: 'Wider beam never scores worse',
        input: `(lambda: (
    log_probs := torch.log(torch.tensor([[0.4, 0.35, 0.25], [0.1, 0.1, 0.8], [0.9, 0.05, 0.05]])),
    r1 := beam_search(log_probs, 1),
    r2 := beam_search(log_probs, 3),
    bool(r2[1] >= r1[1] - 1e-6)
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'max_length truncates decoding',
        input: 'beam_search(torch.log(torch.tensor([[0.5, 0.4, 0.1], [0.2, 0.7, 0.1], [0.1, 0.3, 0.6]])), 2, max_length=2)',
        expected: '([0, 1], -1.0498)',
        hidden: true,
      },
      {
        id: '6',
        description: 'A beam that ends with EOS stops accumulating log-probs',
        input: 'beam_search(torch.log(torch.tensor([[0.5, 0.45, 0.05], [0.3, 0.3, 0.4], [0.3, 0.3, 0.4]])), 2, eos_token=1)',
        expected: '([1], -0.7985)',
        hidden: true,
      },
      {
        id: '7',
        description: 'Beam width 1 cannot keep the EOS beam',
        input: 'beam_search(torch.log(torch.tensor([[0.5, 0.45, 0.05], [0.3, 0.3, 0.4], [0.3, 0.3, 0.4]])), 1, eos_token=1)',
        expected: '([0, 2, 2], -2.5257)',
        hidden: true,
      },
    ],
    hints: [
      'Keep a list of (sequence, score) beams, starting from ([], 0)',
      'Expanding a beam with every token is one tensor op: score + log_probs[step]',
      'Concatenate all candidate scores and keep the best with torch.topk(scores, beam_width)',
      'Carry a beam that already ends in eos_token forward unchanged',
    ],
  },

  'llm-speculative-decoding': {
    note: 'Draw each uniform number with torch.rand. Keep the torch.manual_seed(42) line.',
    starterCode: `import torch

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    """
    Verify draft tokens using speculative decoding.

    Args:
        draft_probs: Probability the draft model assigned to each drafted token,
                     tensor (K,).
        target_probs: Probability the target model assigns to each drafted token,
                      tensor (K,).
        draft_tokens: The K token IDs proposed by the draft model, tensor (K,).
        target_dist_next: Full target distribution for position after last draft token,
                          tensor (vocab_size,) or None.

    Returns:
        accepted_tokens: List of accepted token IDs (Python ints)
        num_accepted: Number of accepted tokens (0 to K)
    """
    torch.manual_seed(42)
    # Your code here
    pass
`,
    solution: `import torch

def speculative_decode(draft_probs, target_probs, draft_tokens, target_dist_next=None):
    torch.manual_seed(42)

    # Acceptance probability min(1, p_target / p_draft); always accept if p_draft == 0
    accept_prob = torch.where(
        draft_probs > 0,
        (target_probs / draft_probs).clamp(max=1.0),
        torch.ones_like(draft_probs),
    )

    accepted_tokens = []
    for i in range(len(draft_tokens)):
        r = torch.rand(1).item()
        if r < accept_prob[i].item():
            accepted_tokens.append(int(draft_tokens[i]))
        else:
            break  # reject this token and everything after it

    return accepted_tokens, len(accepted_tokens)
`,
    testCases: [
      {
        id: '1',
        description: 'Target more confident than draft: accept all',
        input: 'speculative_decode(torch.tensor([0.3, 0.3, 0.3]), torch.tensor([0.9, 0.9, 0.9]), torch.tensor([1, 2, 3]))[1]',
        expected: '3',
        hidden: false,
      },
      {
        id: '2',
        description: 'Accepted tokens are a prefix of the draft',
        input: `(lambda: (
    result := speculative_decode(torch.tensor([0.5, 0.5, 0.5]), torch.tensor([0.6, 0.6, 0.6]), torch.tensor([10, 20, 30])),
    result[0] == [10, 20, 30][:result[1]]
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Count stays within [0, K]',
        input: `(lambda: (
    result := speculative_decode(torch.tensor([0.8, 0.8, 0.8]), torch.tensor([0.2, 0.2, 0.2]), torch.tensor([1, 2, 3])),
    0 <= result[1] <= 3 and len(result[0]) == result[1]
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Always accepts when target >= draft',
        input: 'all(speculative_decode(torch.tensor([0.01]), torch.tensor([0.99]), torch.tensor([42]))[1] == 1 for _ in range(10))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Zero target probability rejects that token and everything after',
        input: 'speculative_decode(torch.tensor([0.5, 0.5, 0.5]), torch.tensor([1.0, 1.0, 0.0]), torch.tensor([10, 20, 30]))',
        expected: '([10, 20], 2)',
        hidden: true,
      },
      {
        id: '6',
        description: 'First token rejected: nothing accepted',
        input: 'speculative_decode(torch.tensor([0.4, 0.2]), torch.tensor([0.0, 0.9]), torch.tensor([7, 8]))',
        expected: '([], 0)',
        hidden: true,
      },
    ],
    hints: [
      'accept_prob = (target_probs / draft_probs).clamp(max=1.0), with torch.where for p_draft == 0',
      'For each token draw r = torch.rand(1).item() and accept if r < accept_prob[i]',
      'Stop at the first rejection; return the accepted prefix as Python ints and its length',
    ],
  },
};
