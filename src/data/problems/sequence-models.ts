import { Problem } from '../../types';

export const sequenceModelsProblems: Problem[] = [
  {
    id: 'rnn-forward',
    title: 'Vanilla RNN: Forward & BPTT',
    section: 'sequence-models',
    difficulty: 'hard',
    description: `
## Vanilla RNN: Forward Pass and Backpropagation Through Time

A recurrent neural network reads a sequence one step at a time and carries a **hidden state** \`h\` that summarizes everything it has seen so far. The *same* weights are reused at every time step.

### Forward
\`\`\`
h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b)        for t = 1..T, starting from h_0
\`\`\`

| Tensor | Shape | Meaning |
|---|---|---|
| \`X\` | \`(N, T, D)\` | batch of N sequences, T steps, D features (batch first) |
| \`h0\` | \`(N, H)\` | initial hidden state |
| \`W_xh\` | \`(D, H)\` | input-to-hidden weights |
| \`W_hh\` | \`(H, H)\` | hidden-to-hidden weights |
| \`b\` | \`(H,)\` | bias |
| returned \`H_all\` | \`(N, T, H)\` | \`H_all[:, t]\` is the hidden state after reading step t (\`h_0\` is **not** included) |

(\`nn.RNN\` stores the transposes, \`weight_ih\` of shape \`(H, D)\`, and has two biases; here we use the \`x @ W\` layout and a single bias.)

### Backward (BPTT)
Given \`dH = dL/dH_all\` of shape \`(N, T, H)\` (the loss can depend on every hidden state), walk the sequence **backwards**. The gradient that reaches \`h_t\` has two parts: the direct one, \`dH[:, t]\`, and the one flowing back from \`h_{t+1}\`:
\`\`\`
dh_next = 0
for t = T..1:
    dh   = dH[:, t] + dh_next
    da   = dh * (1 - h_t ** 2)               # through tanh
    dW_xh += x_t.T @ da
    dW_hh += h_{t-1}.T @ da
    db    += da.sum(axis=0)
    dX[:, t] = da @ W_xh.T
    dh_next  = da @ W_hh.T                   # flows into h_{t-1}
dh0 = dh_next
\`\`\`
The repeated multiplication by \`W_hh.T\` and \`(1 - h**2)\` is why gradients **vanish or explode** over long sequences.

### Function Signatures
\`\`\`python
def rnn_forward(X, h0, W_xh, W_hh, b) -> np.ndarray:          # returns H_all (N, T, H)
def rnn_backward(X, h0, W_xh, W_hh, H_all, dH) -> dict:
\`\`\`

### Expected Return Format (\`rnn_backward\`)
Return a dictionary with these keys, each the same shape as the matching input:
- \`'dX'\`: \`(N, T, D)\`
- \`'dh0'\`: \`(N, H)\`
- \`'dW_xh'\`: \`(D, H)\`
- \`'dW_hh'\`: \`(H, H)\`
- \`'db'\`: \`(H,)\`
    `,
    examples: [
      {
        input: 'X = ones((1, 3, 1)), h0 = [[0]], W_xh = [[0.5]], W_hh = [[1.0]], b = [0]',
        output: '[[[0.462117], [0.74522], [0.846938]]]',
        explanation: 'h1 = tanh(0.5), h2 = tanh(0.5 + h1), h3 = tanh(0.5 + h2)',
      },
    ],
    starterCode: `import numpy as np

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
    Backpropagation through time.

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
    testCases: [
      {
        id: '1',
        description: 'Output shape (N, T, H)',
        input: 'rnn_forward(np.random.randn(2, 5, 3), np.zeros((2, 4)), np.random.randn(3, 4), np.random.randn(4, 4), np.zeros(4)).shape',
        expected: '(2, 5, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Scalar RNN unrolled for 3 steps',
        input: 'np.round(rnn_forward(np.ones((1, 3, 1)), np.zeros((1, 1)), np.array([[0.5]]), np.array([[1.0]]), np.array([0.0])), 6).tolist()',
        expected: '[[[0.462117], [0.74522], [0.846938]]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Last hidden state on random inputs (uses h0 and b)',
        input: 'np.round(rnn_forward(np.random.randn(2, 4, 3), np.random.randn(2, 3), np.random.randn(3, 3) * 0.5, np.random.randn(3, 3) * 0.5, np.random.randn(3) * 0.1)[:, -1], 5).tolist()',
        expected: '[[0.22011, 0.66738, -0.82641], [-0.83729, -0.60483, 0.65941]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'BPTT gradients match finite differences (lists any mismatching keys)',
        input: `(lambda: (
    X := np.random.randn(2, 4, 3), h0 := np.random.randn(2, 3),
    Wx := np.random.randn(3, 3) * 0.5, Wh := np.random.randn(3, 3) * 0.5, b := np.random.randn(3) * 0.1,
    G := np.random.randn(2, 4, 3),
    g := rnn_backward(X, h0, Wx, Wh, rnn_forward(X, h0, Wx, Wh, b), G),
    L := lambda: float((rnn_forward(X, h0, Wx, Wh, b) * G).sum()),
    bump := lambda P, i, d: (P.flat.__setitem__(i, P.flat[i] + d), L())[-1],
    fd := lambda P: np.array([(bump(P, i, 1e-5) - bump(P, i, -2e-5)) / 2e-5 + 0 * bump(P, i, 1e-5) for i in range(P.size)]).reshape(P.shape),
    [k for k, P in [('dW_hh', Wh), ('dW_xh', Wx), ('db', b), ('dh0', h0), ('dX', X)] if not np.allclose(g[k], fd(P), atol=1e-6)]
)[-1])()`,
        expected: '[]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradient values for a 2-step scalar RNN',
        input: "(lambda: (X := np.array([[[1.0], [2.0]]]), h0 := np.array([[0.5]]), Wx := np.array([[0.3]]), Wh := np.array([[-0.7]]), b := np.array([0.1]), Hs := rnn_forward(X, h0, Wx, Wh, b), g := rnn_backward(X, h0, Wx, Wh, Hs, np.ones((1, 2, 1))), [round(float(g[k].sum()), 6) for k in ('dX', 'dh0', 'dW_xh', 'dW_hh', 'db')])[-1])()",
        expected: '[0.359144, -0.374866, 1.858772, 0.300815, 1.197147]',
        hidden: true,
      },
    ],
    hints: [
      'Forward: loop over t, compute h = np.tanh(X[:, t] @ W_xh + h @ W_hh + b), collect each h and np.stack(hs, axis=1).',
      'Backward: initialise all gradients with np.zeros_like and dh_next = np.zeros_like(h0), then loop t from T-1 down to 0.',
      'h_{t-1} is H_all[:, t-1] for t > 0 and h0 for t = 0. The tanh derivative uses the output: 1 - h_t**2.',
      'Accumulate dW_xh, dW_hh and db over time (the weights are shared); dX[:, t] = da @ W_xh.T and dh_next = da @ W_hh.T.',
    ],
    solution: `import numpy as np

def rnn_forward(X, h0, W_xh, W_hh, b):
    """
    Run a vanilla RNN over a batch of sequences.
    """
    h = h0
    hs = []
    for t in range(X.shape[1]):
        h = np.tanh(X[:, t] @ W_xh + h @ W_hh + b)
        hs.append(h)
    return np.stack(hs, axis=1)


def rnn_backward(X, h0, W_xh, W_hh, H_all, dH):
    """
    Backpropagation through time.
    """
    dX = np.zeros_like(X, dtype=float)
    dW_xh = np.zeros_like(W_xh, dtype=float)
    dW_hh = np.zeros_like(W_hh, dtype=float)
    db = np.zeros(W_hh.shape[0])
    dh_next = np.zeros_like(h0, dtype=float)

    for t in reversed(range(X.shape[1])):
        h_t = H_all[:, t]
        h_prev = H_all[:, t - 1] if t > 0 else h0
        dh = dH[:, t] + dh_next            # direct gradient + gradient from the future
        da = dh * (1 - h_t ** 2)           # back through tanh
        dW_xh += X[:, t].T @ da
        dW_hh += h_prev.T @ da
        db += da.sum(axis=0)
        dX[:, t] = da @ W_xh.T
        dh_next = da @ W_hh.T

    return {'dX': dX, 'dh0': dh_next, 'dW_xh': dW_xh, 'dW_hh': dW_hh, 'db': db}
`,
  },
  {
    id: 'lstm-cell',
    title: 'LSTM Cell',
    section: 'sequence-models',
    difficulty: 'medium',
    description: `
## LSTM Cell (one time step)

The LSTM fixes the vanilla RNN's vanishing gradients with a separate **cell state** \`c\` that is updated *additively*, controlled by three gates. When the forget gate is close to 1, gradients flow back through \`c\` almost unchanged.

### Equations (PyTorch's \`nn.LSTMCell\`)
\`\`\`
gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh      # (N, 4H)
i, f, g, o = split(gates, 4)                            # each (N, H), in this order

i = sigmoid(i)        # input gate:  how much new content to write
f = sigmoid(f)        # forget gate: how much of the old cell to keep
g = tanh(g)           # candidate cell content
o = sigmoid(o)        # output gate: how much of the cell to expose

c = f * c_prev + i * g
h = o * tanh(c)
\`\`\`

### Weight layout
The four gates are stacked along the **first** axis of each weight, in the order **i, f, g, o**, exactly like \`nn.LSTMCell.weight_ih\` / \`weight_hh\`:

| Rows | Gate |
|---|---|
| \`0 : H\` | input gate \`i\` |
| \`H : 2H\` | forget gate \`f\` |
| \`2H : 3H\` | candidate \`g\` |
| \`3H : 4H\` | output gate \`o\` |

| Tensor | Shape |
|---|---|
| \`x\` | \`(N, D)\` |
| \`h_prev\`, \`c_prev\` | \`(N, H)\` |
| \`W_ih\` | \`(4H, D)\` |
| \`W_hh\` | \`(4H, H)\` |
| \`b_ih\`, \`b_hh\` | \`(4H,)\` |

### Function Signature
\`\`\`python
def lstm_cell(x, h_prev, c_prev, W_ih, W_hh, b_ih, b_hh):
\`\`\`

### Return Format
Return a tuple \`(h, c)\`: the new hidden state and the new cell state, each of shape \`(N, H)\`.
    `,
    examples: [
      {
        input: 'All weights and biases zero, c_prev = [[1.0, -2.0]]',
        output: '(array([[0.231059, -0.380797]]), array([[0.5, -1.0]]))',
        explanation: 'Every gate is sigmoid(0) = 0.5 and g = tanh(0) = 0, so c = 0.5 * c_prev and h = 0.5 * tanh(c)',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))


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
    testCases: [
      {
        id: '1',
        description: 'Output shapes',
        input: 'tuple(a.shape for a in lstm_cell(np.random.randn(2, 3), np.random.randn(2, 4), np.random.randn(2, 4), np.random.randn(16, 3), np.random.randn(16, 4), np.random.randn(16), np.random.randn(16)))',
        expected: '((2, 4), (2, 4))',
        hidden: false,
      },
      {
        id: '2',
        description: 'Zero weights: all gates 0.5, candidate 0',
        input: 'tuple(np.round(a, 6).tolist() for a in lstm_cell(np.array([[0.3, -0.1]]), np.zeros((1, 2)), np.array([[1.0, -2.0]]), np.zeros((8, 2)), np.zeros((8, 2)), np.zeros(8), np.zeros(8)))',
        expected: '([[0.231059, -0.380797]], [[0.5, -1.0]])',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gate order: saturate (i, f, o) = (0, 1, 1), then (1, 0, 1) with g = 1',
        input: `(lambda: (
    W1 := np.random.randn(8, 2) * 0.1, W2 := np.random.randn(8, 2) * 0.1,
    x := np.random.randn(1, 2), h := np.random.randn(1, 2), c := np.array([[0.7, -0.3]]),
    keep := lstm_cell(x, h, c, W1, W2, np.array([-100.0] * 2 + [100.0] * 2 + [0.0] * 2 + [100.0] * 2), np.zeros(8)),
    write := lstm_cell(x, h, c, W1, W2, np.array([100.0] * 2 + [-100.0] * 2 + [100.0] * 2 + [100.0] * 2), np.zeros(8)),
    [np.round(a, 4).tolist() for a in keep + write]
)[-1])()`,
        expected: '[[[0.6044, -0.2913]], [[0.7, -0.3]], [[0.7616, 0.7616]], [[1.0, 1.0]]]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Random inputs and weights',
        input: 'tuple(np.round(a, 5).tolist() for a in lstm_cell(np.random.randn(2, 3), np.random.randn(2, 2), np.random.randn(2, 2), np.random.randn(8, 3) * 0.5, np.random.randn(8, 2) * 0.5, np.random.randn(8) * 0.1, np.random.randn(8) * 0.1))',
        expected: '([[-0.01003, 0.32941], [-0.0162, 0.33173]], [[-0.08157, 0.52188], [-0.26482, 0.59716]])',
        hidden: true,
      },
    ],
    hints: [
      'Compute all four gates with one matrix product each: gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh.',
      'np.split(gates, 4, axis=-1) returns the chunks in the order i, f, g, o.',
      'Sigmoid for i, f, o; tanh for g. Then c = f * c_prev + i * g and h = o * np.tanh(c).',
    ],
    solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def lstm_cell(x, h_prev, c_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One LSTM step (gate order i, f, g, o, as in nn.LSTMCell).
    """
    gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh
    i, f, g, o = np.split(gates, 4, axis=-1)
    i, f, g, o = sigmoid(i), sigmoid(f), np.tanh(g), sigmoid(o)
    c = f * c_prev + i * g
    h = o * np.tanh(c)
    return h, c
`,
  },
  {
    id: 'gru-cell',
    title: 'GRU Cell',
    section: 'sequence-models',
    difficulty: 'medium',
    description: `
## GRU Cell (one time step)

The Gated Recurrent Unit merges the LSTM's cell and hidden state into one vector and uses two gates instead of three. It has fewer parameters and often trains just as well.

### Equations (PyTorch's \`nn.GRUCell\`)
\`\`\`
gi = x @ W_ih.T + b_ih              # (N, 3H), split into  i_r, i_z, i_n
gh = h_prev @ W_hh.T + b_hh         # (N, 3H), split into  h_r, h_z, h_n

r = sigmoid(i_r + h_r)              # reset gate
z = sigmoid(i_z + h_z)              # update gate
n = tanh(i_n + r * h_n)             # candidate state
h = (1 - z) * n + z * h_prev
\`\`\`

### Conventions to get right
- **Gate order** along the first axis of the weights: **r, z, n** (rows \`0:H\`, \`H:2H\`, \`2H:3H\`), as in \`nn.GRUCell.weight_ih\` / \`weight_hh\`.
- **Update gate \`z\` keeps the old state**: \`z = 1\` copies \`h_prev\` and \`z = 0\` takes the candidate \`n\`. Some papers swap the roles of \`z\` and \`1 - z\`; PyTorch uses the form above.
- **Reset gate placement**: \`r\` multiplies \`h_n = h_prev @ W_hn.T + b_hn\`, **including the bias \`b_hn\`**, *after* the matrix product. The original paper (Cho et al., 2014) computes \`(r * h_prev) @ W_hn.T\` instead. That gives different numbers, so follow PyTorch here.

| Tensor | Shape |
|---|---|
| \`x\` | \`(N, D)\` |
| \`h_prev\` | \`(N, H)\` |
| \`W_ih\` | \`(3H, D)\` |
| \`W_hh\` | \`(3H, H)\` |
| \`b_ih\`, \`b_hh\` | \`(3H,)\` |

### Function Signature
\`\`\`python
def gru_cell(x, h_prev, W_ih, W_hh, b_ih, b_hh):
\`\`\`

### Return Format
Return the new hidden state \`h\`, shape \`(N, H)\`.
    `,
    examples: [
      {
        input: 'All weights and biases zero, h_prev = [[1.0, -2.0]]',
        output: 'array([[0.5, -1.0]])',
        explanation: 'r = z = 0.5 and n = tanh(0) = 0, so h = 0.5 * 0 + 0.5 * h_prev',
      },
    ],
    starterCode: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))


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
    testCases: [
      {
        id: '1',
        description: 'Output shape',
        input: 'gru_cell(np.random.randn(2, 3), np.random.randn(2, 4), np.random.randn(12, 3), np.random.randn(12, 4), np.random.randn(12), np.random.randn(12)).shape',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Zero weights: h = 0.5 * h_prev',
        input: 'np.round(gru_cell(np.array([[0.3, -0.1]]), np.array([[1.0, -2.0]]), np.zeros((6, 2)), np.zeros((6, 2)), np.zeros(6), np.zeros(6)), 6).tolist()',
        expected: '[[0.5, -1.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'z = 1 keeps h_prev; r = 0 drops h_n including b_hn',
        input: `(lambda: (
    x := np.random.randn(1, 2), h := np.array([[0.4, -0.9]]),
    keep := gru_cell(x, h, np.random.randn(6, 2) * 0.1, np.random.randn(6, 2) * 0.1, np.array([0.0] * 2 + [100.0] * 2 + [0.0] * 2), np.zeros(6)),
    reset := gru_cell(x, h, np.zeros((6, 2)), np.zeros((6, 2)), np.array([-100.0] * 2 + [-100.0] * 2 + [0.3] * 2), np.array([0.0] * 4 + [5.0] * 2)),
    (np.round(keep, 4).tolist(), np.round(reset, 4).tolist())
)[-1])()`,
        expected: '([[0.4, -0.9]], [[0.2913, 0.2913]])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Random inputs and weights',
        input: 'np.round(gru_cell(np.random.randn(2, 3), np.random.randn(2, 2), np.random.randn(6, 3) * 0.5, np.random.randn(6, 2) * 0.5, np.random.randn(6) * 0.1, np.random.randn(6) * 0.1), 5).tolist()',
        expected: '[[0.95395, -0.69198], [-0.29984, -0.87107]]',
        hidden: true,
      },
    ],
    hints: [
      'Compute the input and hidden projections separately: gi = x @ W_ih.T + b_ih and gh = h_prev @ W_hh.T + b_hh. They must stay separate because r only multiplies the hidden part of n.',
      'np.split(gi, 3, axis=-1) gives (i_r, i_z, i_n); same for gh.',
      'r = sigmoid(i_r + h_r), z = sigmoid(i_z + h_z), n = tanh(i_n + r * h_n), then h = (1 - z) * n + z * h_prev.',
    ],
    solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def gru_cell(x, h_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One GRU step (gate order r, z, n, as in nn.GRUCell).
    """
    gi = x @ W_ih.T + b_ih
    gh = h_prev @ W_hh.T + b_hh
    i_r, i_z, i_n = np.split(gi, 3, axis=-1)
    h_r, h_z, h_n = np.split(gh, 3, axis=-1)

    r = sigmoid(i_r + h_r)
    z = sigmoid(i_z + h_z)
    n = np.tanh(i_n + r * h_n)       # reset gate applied after the matmul (PyTorch)
    return (1 - z) * n + z * h_prev
`,
  },
];
