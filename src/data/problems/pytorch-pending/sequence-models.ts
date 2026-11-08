// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/sequence-models.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const sequenceModelsPyTorchPending: Record<string, unknown> = {
  'rnn-forward': {
    note: "Implement both functions from scratch with tensor ops; nn.RNN isn't allowed (and isn't in the browser shim). Write rnn_backward by hand: a hidden test checks it against autograd.",
    starterCode: `import torch

def rnn_forward(X, h0, W_xh, W_hh, b):
    """
    Run a vanilla RNN over a batch of sequences.

    Args:
        X: Inputs (N, T, D)
        h0: Initial hidden state (N, H)
        W_xh: Input-to-hidden weights (D, H)
        W_hh: Hidden-to-hidden weights (H, H)
        b: Bias (H,)

    Returns:
        H_all: Hidden states for every step (N, T, H)
    """
    # Your code here
    pass


def rnn_backward(X, h0, W_xh, W_hh, H_all, dH):
    """
    Backpropagation through time, by hand (no autograd).

    Args:
        X, h0, W_xh, W_hh: Same as rnn_forward
        H_all: Output of rnn_forward (N, T, H)
        dH: Gradient of the loss w.r.t. H_all (N, T, H)

    Returns:
        dict with 'dX', 'dh0', 'dW_xh', 'dW_hh', 'db'
    """
    # Your code here
    pass
`,
    solution: `import torch

def rnn_forward(X, h0, W_xh, W_hh, b):
    """
    Run a vanilla RNN over a batch of sequences.
    """
    h = h0
    hs = []
    for t in range(X.shape[1]):
        h = torch.tanh(X[:, t] @ W_xh + h @ W_hh + b)
        hs.append(h)
    return torch.stack(hs, dim=1)


def rnn_backward(X, h0, W_xh, W_hh, H_all, dH):
    """
    Backpropagation through time, by hand (no autograd).
    """
    dX = torch.zeros_like(X)
    dW_xh = torch.zeros_like(W_xh)
    dW_hh = torch.zeros_like(W_hh)
    db = torch.zeros(W_hh.shape[0])
    dh_next = torch.zeros_like(h0)

    for t in reversed(range(X.shape[1])):
        h_t = H_all[:, t]
        h_prev = H_all[:, t - 1] if t > 0 else h0
        dh = dH[:, t] + dh_next            # direct gradient + gradient from the future
        da = dh * (1 - h_t ** 2)           # back through tanh
        dW_xh = dW_xh + X[:, t].T @ da
        dW_hh = dW_hh + h_prev.T @ da
        db = db + da.sum(dim=0)
        dX[:, t] = da @ W_xh.T
        dh_next = da @ W_hh.T

    return {'dX': dX, 'dh0': dh_next, 'dW_xh': dW_xh, 'dW_hh': dW_hh, 'db': db}
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape (N, T, H)',
        input: 'tuple(rnn_forward(torch.randn(2, 5, 3), torch.zeros(2, 4), torch.randn(3, 4), torch.randn(4, 4), torch.zeros(4)).shape)',
        expected: '(2, 5, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Scalar RNN unrolled for 3 steps',
        input: 'np.round(rnn_forward(torch.ones(1, 3, 1), torch.zeros(1, 1), torch.tensor([[0.5]]), torch.tensor([[1.0]]), torch.tensor([0.0])).double().numpy(), 5).tolist()',
        expected: '[[[0.46212], [0.74522], [0.84694]]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Last hidden state on random inputs (uses h0 and b)',
        input: `(lambda: (
    t := lambda *s: torch.from_numpy(np.random.randn(*s)).float(),
    np.round(rnn_forward(t(2, 4, 3), t(2, 3), t(3, 3) * 0.5, t(3, 3) * 0.5, t(3) * 0.1)[:, -1].double().numpy(), 5).tolist()
)[-1])()`,
        expected: '[[0.22011, 0.66738, -0.82641], [-0.83729, -0.60483, 0.65941]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'rnn_backward matches autograd (lists any mismatching keys)',
        input: `(lambda: (
    t := lambda *s: torch.from_numpy(np.random.randn(*s)).float(),
    X := t(2, 4, 3).requires_grad_(), h0 := t(2, 3).requires_grad_(),
    Wx := (t(3, 3) * 0.5).requires_grad_(), Wh := (t(3, 3) * 0.5).requires_grad_(), b := (t(3) * 0.1).requires_grad_(),
    G := t(2, 4, 3),
    H := rnn_forward(X, h0, Wx, Wh, b),
    (H * G).sum().backward(),
    g := rnn_backward(X.detach(), h0.detach(), Wx.detach(), Wh.detach(), H.detach(), G),
    [k for k, P in [('dW_hh', Wh), ('dW_xh', Wx), ('db', b), ('dh0', h0), ('dX', X)] if not bool(torch.allclose(g[k], P.grad, atol=1e-5))]
)[-1])()`,
        expected: '[]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradient values for a 2-step scalar RNN',
        input: "(lambda: (X := torch.tensor([[[1.0], [2.0]]]), h0 := torch.tensor([[0.5]]), Wx := torch.tensor([[0.3]]), Wh := torch.tensor([[-0.7]]), b := torch.tensor([0.1]), Hs := rnn_forward(X, h0, Wx, Wh, b), g := rnn_backward(X, h0, Wx, Wh, Hs, torch.ones(1, 2, 1)), [round(g[k].sum().item(), 5) for k in ('dX', 'dh0', 'dW_xh', 'dW_hh', 'db')])[-1])()",
        expected: '[0.35914, -0.37487, 1.85877, 0.30082, 1.19715]',
        hidden: true,
      },
    ],
    hints: [
      'Forward: loop over t, h = torch.tanh(X[:, t] @ W_xh + h @ W_hh + b), then torch.stack(hs, dim=1).',
      'Backward: start from torch.zeros_like(...) gradients and dh_next = torch.zeros_like(h0); loop t from T-1 down to 0.',
      'da = (dH[:, t] + dh_next) * (1 - h_t ** 2); accumulate X[:, t].T @ da, h_prev.T @ da and da.sum(dim=0).',
      'Check yourself: build the graph with requires_grad=True, call (H * dH).sum().backward() and compare with .grad.',
    ],
  },
  'lstm-cell': {
    note: "Implement it with tensor ops (@, torch.sigmoid, torch.tanh, .chunk); nn.LSTM and nn.LSTMCell aren't allowed (and aren't in the browser shim). The weight layout is the same as nn.LSTMCell's, so in real PyTorch your function reproduces it exactly.",
    starterCode: `import torch

def lstm_cell(x, h_prev, c_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One LSTM step (gate order i, f, g, o, as in nn.LSTMCell).

    Args:
        x: Input (N, D)
        h_prev: Previous hidden state (N, H)
        c_prev: Previous cell state (N, H)
        W_ih: Input weights (4H, D)
        W_hh: Hidden weights (4H, H)
        b_ih, b_hh: Biases (4H,)

    Returns:
        (h, c): new hidden and cell states, each (N, H)
    """
    # Your code here
    pass
`,
    solution: `import torch

def lstm_cell(x, h_prev, c_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One LSTM step (gate order i, f, g, o, as in nn.LSTMCell).
    """
    gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh
    i, f, g, o = gates.chunk(4, dim=-1)
    i, f, g, o = torch.sigmoid(i), torch.sigmoid(f), torch.tanh(g), torch.sigmoid(o)
    c = f * c_prev + i * g
    h = o * torch.tanh(c)
    return h, c
`,
    testCases: [
      {
        id: '1',
        description: 'Output shapes',
        input: 'tuple(tuple(a.shape) for a in lstm_cell(torch.randn(2, 3), torch.randn(2, 4), torch.randn(2, 4), torch.randn(16, 3), torch.randn(16, 4), torch.randn(16), torch.randn(16)))',
        expected: '((2, 4), (2, 4))',
        hidden: false,
      },
      {
        id: '2',
        description: 'Zero weights: all gates 0.5, candidate 0',
        input: 'tuple(np.round(a.double().numpy(), 5).tolist() for a in lstm_cell(torch.tensor([[0.3, -0.1]]), torch.zeros(1, 2), torch.tensor([[1.0, -2.0]]), torch.zeros(8, 2), torch.zeros(8, 2), torch.zeros(8), torch.zeros(8)))',
        expected: '([[0.23106, -0.3808]], [[0.5, -1.0]])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gate order: saturate (i, f, o) = (0, 1, 1), then (1, 0, 1) with g = 1',
        input: `(lambda: (
    t := lambda *s: torch.from_numpy(np.random.randn(*s)).float(),
    W1 := t(8, 2) * 0.1, W2 := t(8, 2) * 0.1,
    x := t(1, 2), h := t(1, 2), c := torch.tensor([[0.7, -0.3]]),
    keep := lstm_cell(x, h, c, W1, W2, torch.tensor([-100.0] * 2 + [100.0] * 2 + [0.0] * 2 + [100.0] * 2), torch.zeros(8)),
    write := lstm_cell(x, h, c, W1, W2, torch.tensor([100.0] * 2 + [-100.0] * 2 + [100.0] * 2 + [100.0] * 2), torch.zeros(8)),
    [np.round(a.double().numpy(), 4).tolist() for a in keep + write]
)[-1])()`,
        expected: '[[[0.6044, -0.2913]], [[0.7, -0.3]], [[0.7616, 0.7616]], [[1.0, 1.0]]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Random inputs and weights',
        input: `(lambda: (
    t := lambda *s: torch.from_numpy(np.random.randn(*s)).float(),
    tuple(np.round(a.double().numpy(), 5).tolist() for a in lstm_cell(t(2, 3), t(2, 2), t(2, 2), t(8, 3) * 0.5, t(8, 2) * 0.5, t(8) * 0.1, t(8) * 0.1))
)[-1])()`,
        expected: '([[-0.01003, 0.32941], [-0.0162, 0.33173]], [[-0.08157, 0.52188], [-0.26482, 0.59716]])',
        hidden: true,
      },
    ],
    hints: [
      'gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh has shape (N, 4H).',
      'gates.chunk(4, dim=-1) returns i, f, g, o in that order.',
      'torch.sigmoid for i, f, o; torch.tanh for g. Then c = f * c_prev + i * g and h = o * torch.tanh(c).',
    ],
  },
  'gru-cell': {
    note: "Implement it with tensor ops (@, torch.sigmoid, torch.tanh, .chunk); nn.GRU and nn.GRUCell aren't allowed (and aren't in the browser shim). Follow nn.GRUCell's conventions: gate order r, z, n, and r multiplies (h_prev @ W_hn.T + b_hn).",
    starterCode: `import torch

def gru_cell(x, h_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One GRU step (gate order r, z, n, as in nn.GRUCell).

    Args:
        x: Input (N, D)
        h_prev: Previous hidden state (N, H)
        W_ih: Input weights (3H, D)
        W_hh: Hidden weights (3H, H)
        b_ih, b_hh: Biases (3H,)

    Returns:
        h: New hidden state (N, H)
    """
    # Your code here
    pass
`,
    solution: `import torch

def gru_cell(x, h_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One GRU step (gate order r, z, n, as in nn.GRUCell).
    """
    i_r, i_z, i_n = (x @ W_ih.T + b_ih).chunk(3, dim=-1)
    h_r, h_z, h_n = (h_prev @ W_hh.T + b_hh).chunk(3, dim=-1)

    r = torch.sigmoid(i_r + h_r)
    z = torch.sigmoid(i_z + h_z)
    n = torch.tanh(i_n + r * h_n)      # reset gate applied after the matmul
    return (1 - z) * n + z * h_prev
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape',
        input: 'tuple(gru_cell(torch.randn(2, 3), torch.randn(2, 4), torch.randn(12, 3), torch.randn(12, 4), torch.randn(12), torch.randn(12)).shape)',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Zero weights: h = 0.5 * h_prev',
        input: 'gru_cell(torch.tensor([[0.3, -0.1]]), torch.tensor([[1.0, -2.0]]), torch.zeros(6, 2), torch.zeros(6, 2), torch.zeros(6), torch.zeros(6)).tolist()',
        expected: '[[0.5, -1.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'z = 1 keeps h_prev; r = 0 drops h_n including b_hn',
        input: `(lambda: (
    t := lambda *s: torch.from_numpy(np.random.randn(*s)).float(),
    x := t(1, 2), h := torch.tensor([[0.4, -0.9]]),
    keep := gru_cell(x, h, t(6, 2) * 0.1, t(6, 2) * 0.1, torch.tensor([0.0] * 2 + [100.0] * 2 + [0.0] * 2), torch.zeros(6)),
    reset := gru_cell(x, h, torch.zeros(6, 2), torch.zeros(6, 2), torch.tensor([-100.0] * 2 + [-100.0] * 2 + [0.3] * 2), torch.tensor([0.0] * 4 + [5.0] * 2)),
    (np.round(keep.double().numpy(), 4).tolist(), np.round(reset.double().numpy(), 4).tolist())
)[-1])()`,
        expected: '([[0.4, -0.9]], [[0.2913, 0.2913]])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Random inputs and weights',
        input: `(lambda: (
    t := lambda *s: torch.from_numpy(np.random.randn(*s)).float(),
    np.round(gru_cell(t(2, 3), t(2, 2), t(6, 3) * 0.5, t(6, 2) * 0.5, t(6) * 0.1, t(6) * 0.1).double().numpy(), 5).tolist()
)[-1])()`,
        expected: '[[0.95395, -0.69198], [-0.29984, -0.87107]]',
        hidden: true,
      },
    ],
    hints: [
      'Keep the input and hidden projections separate: (x @ W_ih.T + b_ih).chunk(3, dim=-1) and (h_prev @ W_hh.T + b_hh).chunk(3, dim=-1).',
      'r = torch.sigmoid(i_r + h_r), z = torch.sigmoid(i_z + h_z).',
      'n = torch.tanh(i_n + r * h_n), then h = (1 - z) * n + z * h_prev.',
    ],
  },
};
