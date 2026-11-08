// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/llm-internals.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const llmInternalsPyTorchPending: Record<string, unknown> = {
  'rmsnorm-swiglu': {
    note: 'Implement RMSNorm and the gated MLP with tensor ops. Don\'t use nn.RMSNorm or F.rms_norm; F.silu (or x * torch.sigmoid(x)) is fine. A hidden test compares against nn.RMSNorm.',
    starterCode: `import torch
import torch.nn.functional as F

def rms_norm(x, weight, eps=1e-6):
    """
    RMSNorm over the last dim.

    Args:
        x: (..., d_model)
        weight: (d_model,) learned scale

    Returns:
        Tensor with the same shape as x
    """
    # Your code here
    pass


def swiglu_ffn(x, W_gate, W_up, W_down):
    """
    SwiGLU feed-forward network: (silu(x @ W_gate) * (x @ W_up)) @ W_down

    Args:
        x: (..., d_model)
        W_gate, W_up: (d_model, d_ff)
        W_down: (d_ff, d_model)

    Returns:
        Tensor of shape (..., d_model)
    """
    # Your code here
    pass


def llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6):
    """
    Pre-norm MLP sub-block with a residual: x + swiglu_ffn(rms_norm(x)).

    Returns:
        Tensor with the same shape as x
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def rms_norm(x, weight, eps=1e-6):
    return x * torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + eps) * weight


def swiglu_ffn(x, W_gate, W_up, W_down):
    return (F.silu(x @ W_gate) * (x @ W_up)) @ W_down


def llama_mlp_block(x, norm_weight, W_gate, W_up, W_down, eps=1e-6):
    return x + swiglu_ffn(rms_norm(x, norm_weight, eps), W_gate, W_up, W_down)
`,
    testCases: [
      {
        id: '1',
        description: 'rms_norm values',
        input: 'np.round(rms_norm(torch.tensor([[3.0, 4.0]]), torch.ones(2)).double().numpy(), 4).tolist()',
        expected: '[[0.8485, 1.1314]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Block output shape',
        input: 'llama_mlp_block(torch.randn(4, 8), torch.ones(8), torch.randn(8, 16), torch.randn(8, 16), torch.randn(16, 8)).shape',
        expected: '(4, 8)',
        hidden: false,
      },
      {
        id: '3',
        description: 'SwiGLU on a hand-checkable input',
        input: 'np.round(swiglu_ffn(torch.tensor([[1.0, -1.0]]), torch.tensor([[1.0], [0.0]]), torch.tensor([[2.0], [1.0]]), torch.tensor([[1.0, 0.5]])).double().numpy(), 4).tolist()',
        expected: '[[0.7311, 0.3655]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'rms_norm matches nn.RMSNorm',
        input: '(lambda x, w: (lambda ref: (ref.weight.data.copy_(w), bool(torch.allclose(rms_norm(x, w), ref(x), atol=1e-5)))[-1])(torch.nn.RMSNorm(6, eps=1e-6)))(torch.randn(3, 6), torch.rand(6) + 0.5)',
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'SwiGLU matches a reference',
        input: '(lambda x, Wg, Wu, Wd: bool(torch.allclose(swiglu_ffn(x, Wg, Wu, Wd), ((x @ Wg) * torch.sigmoid(x @ Wg) * (x @ Wu)) @ Wd, atol=1e-4)))(torch.randn(2, 3, 8), torch.randn(8, 12), torch.randn(8, 12), torch.randn(12, 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gate is SiLU, not sigmoid or ReLU',
        input: 'round(float(swiglu_ffn(torch.tensor([[-1.0]]), torch.tensor([[1.0]]), torch.tensor([[1.0]]), torch.tensor([[1.0]]))[0, 0]), 4)',
        expected: '0.2689',
        hidden: true,
      },
      {
        id: '7',
        description: 'Block has a residual connection (W_down = 0 gives x back)',
        input: '(lambda x: bool(torch.allclose(llama_mlp_block(x, torch.ones(8), torch.randn(8, 16), torch.randn(8, 16), torch.zeros(16, 8)), x)))(torch.randn(3, 8))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'Block output values',
        input: '(lambda f: round(float(llama_mlp_block(f(4, 8), torch.linspace(0.5, 1.5, 8), f(8, 16) * 0.3, f(8, 16) * 0.3, f(16, 8) * 0.3).sum()), 3))(lambda *s: torch.from_numpy(np.random.randn(*s)).float())',
        expected: '13.739',
        hidden: true,
      },
      {
        id: '9',
        description: 'Gradients flow to all three weight matrices',
        input: '(lambda Ws: (llama_mlp_block(torch.randn(2, 4), torch.ones(4), *Ws).sum().backward(), all(W.grad is not None and W.grad.abs().sum().item() > 0 for W in Ws))[-1])([torch.randn(4, 6, requires_grad=True), torch.randn(4, 6, requires_grad=True), torch.randn(6, 4, requires_grad=True)])',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'RMSNorm: x * torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + eps) * weight',
      'SwiGLU: (F.silu(x @ W_gate) * (x @ W_up)) @ W_down',
      'Block: x + swiglu_ffn(rms_norm(x, norm_weight, eps), ...)',
    ],
  },
  'online-softmax': {
    note: 'Process the keys block by block with torch.maximum, torch.exp and matmul. Don\'t call torch.softmax / F.softmax on a full row, or F.scaled_dot_product_attention; a hidden test compares against F.scaled_dot_product_attention.',
    starterCode: `import math
import torch

def online_softmax(x, block_size):
    """
    Softmax of a 1-D tensor computed with a single streaming pass over blocks
    (running max + running sum), then one normalization pass.

    Returns:
        probs: same shape as x
    """
    # Your code here
    pass


def online_attention(Q, K, V, block_size):
    """
    Attention softmax(Q K^T / sqrt(d)) V computed block by block over the keys,
    FlashAttention style.

    Args:
        Q: (n_q, d), K: (n_k, d), V: (n_k, d_v)
        block_size: number of keys per block

    Returns:
        output: (n_q, d_v)
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def online_softmax(x, block_size):
    m = torch.tensor(float('-inf'))
    l = torch.tensor(0.0)
    for start in range(0, x.shape[0], block_size):
        block = x[start:start + block_size]
        m_new = torch.maximum(m, block.max())
        l = l * torch.exp(m - m_new) + torch.exp(block - m_new).sum()
        m = m_new
    return torch.exp(x - m) / l


def online_attention(Q, K, V, block_size):
    n_q, d = Q.shape
    m = torch.full((n_q, 1), float('-inf'))   # running row max
    l = torch.zeros(n_q, 1)                   # running softmax denominator
    acc = torch.zeros(n_q, V.shape[1])        # running unnormalized output
    for start in range(0, K.shape[0], block_size):
        K_b = K[start:start + block_size]
        V_b = V[start:start + block_size]
        S = Q @ K_b.T / math.sqrt(d)
        m_new = torch.maximum(m, S.max(dim=1, keepdim=True).values)
        scale = torch.exp(m - m_new)
        P = torch.exp(S - m_new)
        l = l * scale + P.sum(dim=1, keepdim=True)
        acc = acc * scale + P @ V_b
        m = m_new
    return acc / l
`,
    testCases: [
      {
        id: '1',
        description: 'online_softmax matches torch.softmax',
        input: '(lambda x: bool(torch.allclose(online_softmax(x, 3), torch.softmax(x, dim=0), atol=1e-6)))(torch.randn(10))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '2',
        description: 'online_attention output shape',
        input: 'online_attention(torch.randn(3, 4), torch.randn(10, 4), torch.randn(10, 2), 4).shape',
        expected: '(3, 2)',
        hidden: false,
      },
      {
        id: '3',
        description: 'online_attention matches standard attention',
        input: '(lambda Q, K, V: bool(torch.allclose(online_attention(Q, K, V, 4), torch.softmax(Q @ K.T / 2.0, dim=-1) @ V, atol=1e-5)))(torch.randn(3, 4), torch.randn(10, 4), torch.randn(10, 2))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Stable for huge logits',
        input: 'np.round(online_softmax(torch.tensor([1000.0, 1001.0, 1002.0]), 2).double().numpy(), 4).tolist()',
        expected: '[0.09, 0.2447, 0.6652]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Max in a later block (old sum must be rescaled)',
        input: 'np.round(online_softmax(torch.tensor([0.0, 1.0, 5.0, 2.0, 9.0]), 2).double().numpy(), 4).tolist()',
        expected: '[0.0001, 0.0003, 0.018, 0.0009, 0.9807]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Any block size gives the same answer',
        input: '(lambda Q, K, V: bool(all(torch.allclose(online_attention(Q, K, V, b), online_attention(Q, K, V, 7), atol=1e-5) for b in [1, 2, 3, 7, 50])))(torch.randn(2, 4), torch.randn(7, 4), torch.randn(7, 3))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '7',
        description: 'Matches F.scaled_dot_product_attention',
        input: '(lambda Q, K, V: bool(torch.allclose(online_attention(Q, K, V, 4), torch.nn.functional.scaled_dot_product_attention(Q[None], K[None], V[None])[0], atol=1e-4)))(torch.randn(4, 8) * 3, torch.randn(9, 8) * 3, torch.randn(9, 5))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'm = torch.full((n_q, 1), float("-inf")); l = torch.zeros(n_q, 1); acc = torch.zeros(n_q, d_v)',
      'Row max of a block: S.max(dim=1, keepdim=True).values; combine with torch.maximum(m, ...).',
      'scale = torch.exp(m - m_new) rescales both l and acc before adding the new block.',
      'Return acc / l.',
    ],
  },
  'moe-routing': {
    note: 'Route with torch.topk and gather/dispatch tokens per expert yourself (torch.where + index_add). Return \'aux_loss\' as a 0-d tensor so it can be added to the training loss. Don\'t compute every expert on every token.',
    starterCode: `import torch

def moe_layer(x, W_router, expert_weights, top_k):
    """
    Top-k mixture-of-experts layer with a load-balancing loss.

    Args:
        x: (T, d) token representations
        W_router: (d, E) router weights
        expert_weights: (E, d, d_out); expert e computes x @ expert_weights[e]
        top_k: experts per token

    Returns:
        dict with 'output' (T, d_out), 'expert_indices' (T, k),
        'gates' (T, k) and 'aux_loss' (0-d tensor)
    """
    # Your code here
    pass
`,
    solution: `import torch

def moe_layer(x, W_router, expert_weights, top_k):
    T = x.shape[0]
    E = W_router.shape[1]

    # 1. Router
    logits = x @ W_router                          # (T, E)
    probs = torch.softmax(logits, dim=-1)          # full distribution, for the aux loss

    # 2. Top-k experts per token (sorted by descending logit), renormalized gates
    topk_logits, expert_indices = torch.topk(logits, top_k, dim=-1)
    gates = torch.softmax(topk_logits, dim=-1)     # (T, k)

    # 3. Dispatch tokens to experts and combine
    output = torch.zeros(T, expert_weights.shape[2])
    for e in range(E):
        token_ids, slot = torch.where(expert_indices == e)
        if token_ids.numel() == 0:
            continue
        expert_out = x[token_ids] @ expert_weights[e]
        output = output.index_add(0, token_ids, gates[token_ids, slot].unsqueeze(-1) * expert_out)

    # 4. Load-balancing loss (gradient flows through P)
    f = torch.bincount(expert_indices.flatten(), minlength=E).float() / (T * top_k)
    P = probs.mean(dim=0)
    aux_loss = E * (f * P).sum()

    return {'output': output, 'expert_indices': expert_indices, 'gates': gates, 'aux_loss': aux_loss}
`,
    testCases: [
      {
        id: '1',
        description: 'Shapes, and gates sum to 1',
        input: '(lambda r: (tuple(r[\'output\'].shape), tuple(r[\'expert_indices\'].shape), bool(torch.allclose(r[\'gates\'].sum(-1), torch.ones(6)))))(moe_layer(torch.randn(6, 4), torch.randn(4, 4), torch.randn(4, 4, 3), 2))',
        expected: '((6, 3), (6, 2), True)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Uniform router gives aux_loss = 1',
        input: 'round(float(moe_layer(torch.randn(6, 4), torch.zeros(4, 4), torch.randn(4, 4, 4), 2)[\'aux_loss\']), 4)',
        expected: '1.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Output equals the dense per-token reference',
        input: '(lambda x, Wr, We: (lambda r: bool(torch.allclose(r[\'output\'], torch.stack([sum(r[\'gates\'][t, j] * (x[t] @ We[r[\'expert_indices\'][t, j]]) for j in range(2)) for t in range(6)]), atol=1e-5)))(moe_layer(x, Wr, We, 2)))(torch.randn(6, 4), torch.randn(4, 4), torch.randn(4, 4, 3))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Experts are chosen by descending router logit',
        input: '(lambda f: moe_layer(f(5, 4), f(4, 6), f(6, 4, 2), 3)[\'expert_indices\'].tolist())(lambda *s: torch.from_numpy(np.random.randn(*s)).float())',
        expected: '[[5, 4, 2], [4, 2, 1], [5, 0, 1], [4, 2, 5], [4, 2, 1]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gates are a softmax over the top-k logits only',
        input: '(lambda x, Wr: (lambda r, L: bool(torch.allclose(r[\'gates\'][:, 0], torch.sigmoid(L.gather(-1, r[\'expert_indices\'])[:, 0] - L.gather(-1, r[\'expert_indices\'])[:, 1]), atol=1e-5)))(moe_layer(x, Wr, torch.randn(5, 4, 4), 2), x @ Wr))(torch.randn(7, 4), torch.randn(4, 5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Collapsed routing pushes aux_loss toward E',
        input: 'round(float(moe_layer(torch.ones(6, 4), torch.cat([torch.full((4, 1), 10.0), torch.zeros(4, 3)], dim=1), torch.randn(4, 4, 4), 1)[\'aux_loss\']), 4)',
        expected: '4.0',
        hidden: true,
      },
      {
        id: '7',
        description: 'top_k = 1: gate is 1 and output is the chosen expert',
        input: '(lambda x, Wr, We: (lambda r: bool(torch.allclose(r[\'gates\'], torch.ones(8, 1)) and torch.allclose(r[\'output\'], torch.einsum(\'td,tdo->to\', x, We[(x @ Wr).argmax(dim=1)]), atol=1e-5)))(moe_layer(x, Wr, We, 1)))(torch.randn(8, 4), torch.randn(4, 3), torch.randn(3, 4, 2))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '8',
        description: 'aux_loss value',
        input: '(lambda f: round(float(moe_layer(f(10, 4), f(4, 4), f(4, 4, 4), 2)[\'aux_loss\']), 4))(lambda *s: torch.from_numpy(np.random.randn(*s)).float())',
        expected: '1.3995',
        hidden: true,
      },
      {
        id: '9',
        description: 'aux_loss is differentiable w.r.t. the router',
        input: '(lambda Wr: (moe_layer(torch.randn(10, 4), Wr, torch.randn(4, 4, 4), 2)[\'aux_loss\'].backward(), bool(Wr.grad is not None and Wr.grad.abs().sum().item() > 0))[-1])(torch.randn(4, 4, requires_grad=True))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'topk_logits, expert_indices = torch.topk(logits, k, dim=-1); gates = torch.softmax(topk_logits, dim=-1)',
      'token_ids, slot = torch.where(expert_indices == e) lists the (token, slot) pairs routed to expert e.',
      'output = output.index_add(0, token_ids, gates[token_ids, slot].unsqueeze(-1) * (x[token_ids] @ expert_weights[e]))',
      'f = torch.bincount(expert_indices.flatten(), minlength=E).float() / (T * k); aux = E * (f * probs.mean(0)).sum()',
    ],
  },
  'perplexity': {
    note: 'Implement the cross-entropy yourself with F.log_softmax (or torch.logsumexp) and gather. Don\'t use F.cross_entropy or nn.CrossEntropyLoss; a hidden test compares against F.cross_entropy with ignore_index. \'mean_nll\' and \'perplexity\' may be 0-d tensors.',
    starterCode: `import torch
import torch.nn.functional as F

def perplexity(logits, targets, mask=None):
    """
    Next-token cross-entropy and perplexity.

    Args:
        logits: (..., V)
        targets: (...) integer token ids (long)
        mask: (...) 1 for real tokens, 0 for padding (None = all real)

    Returns:
        dict with 'token_nll' (same shape as targets), 'mean_nll' and
        'perplexity' (0-d tensors or floats)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def perplexity(logits, targets, mask=None):
    log_probs = F.log_softmax(logits.float(), dim=-1)
    token_nll = -log_probs.gather(-1, targets.long().unsqueeze(-1)).squeeze(-1)

    if mask is None:
        mask = torch.ones_like(token_nll)
    mask = mask.to(token_nll.dtype)
    token_nll = token_nll * mask

    mean_nll = token_nll.sum() / mask.sum()
    return {'token_nll': token_nll, 'mean_nll': mean_nll, 'perplexity': torch.exp(mean_nll)}
`,
    testCases: [
      {
        id: '1',
        description: 'Uniform logits give perplexity = vocab size',
        input: 'round(float(perplexity(torch.zeros(3, 5), torch.tensor([0, 1, 2]))[\'perplexity\']), 4)',
        expected: '5.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Per-token NLL values',
        input: 'np.round(perplexity(torch.tensor([[2.0, 1.0, 0.0], [0.0, 0.0, 3.0]]), torch.tensor([0, 2]))[\'token_nll\'].double().numpy(), 4).tolist()',
        expected: '[0.4076, 0.0949]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Matches F.cross_entropy with ignore_index on padding',
        input: '(lambda L, y, mask: bool(abs(float(perplexity(L, y, mask)[\'mean_nll\']) - torch.nn.functional.cross_entropy(L.reshape(-1, 4), y.masked_fill(mask == 0, -100).reshape(-1), ignore_index=-100).item()) < 1e-5))(torch.randn(2, 3, 4), torch.tensor([[0, 3, 1], [2, 2, 0]]), torch.tensor([[1, 1, 1], [1, 1, 0]]))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Masked positions have token_nll = 0',
        input: 'np.round(perplexity(torch.tensor([[[1.0, 0.0], [0.0, 1.0]]]), torch.tensor([[0, 0]]), torch.tensor([[1, 0]]))[\'token_nll\'].double().numpy(), 4).tolist()',
        expected: '[[0.3133, 0.0]]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Stable for huge logits',
        input: 'round(float(perplexity(torch.tensor([[1000.0, 999.0, 0.0]]), torch.tensor([1]))[\'mean_nll\']), 4)',
        expected: '1.3133',
        hidden: true,
      },
      {
        id: '6',
        description: 'perplexity = exp(mean_nll), values',
        input: '(lambda r: (round(float(r[\'mean_nll\']), 4), round(float(r[\'perplexity\']), 3)))(perplexity(torch.from_numpy(np.random.randn(2, 5, 6) * 2).float(), torch.from_numpy(np.random.randint(0, 6, size=(2, 5)))))',
        expected: '(3.8495, 46.971)',
        hidden: true,
      },
    ],
    hints: [
      'log_probs = F.log_softmax(logits, dim=-1)',
      'token_nll = -log_probs.gather(-1, targets.unsqueeze(-1)).squeeze(-1)',
      'Multiply by mask.float(), divide the sum by mask.sum(), and torch.exp the mean.',
    ],
  },
};
