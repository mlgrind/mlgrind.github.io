import { Problem } from '../../types';

export const sequenceModelsProblems: Problem[] = [
  {
    id: 'rnn-forward',
    title: 'Vanilla RNN: Forward & BPTT',
    section: 'sequence-models',
    difficulty: 'hard',
    description: `
## Vanilla RNN: Forward & BPTT

### What you'll build
Two functions: \`rnn_forward\`, which runs a vanilla (Elman) RNN over a batch of sequences, and \`rnn_backward\`, which computes every gradient by hand with **backpropagation through time (BPTT)**.

### Background
An RNN reads a sequence one step at a time and carries a **hidden state** \`h\` that summarizes everything seen so far, reusing the **same weights** at every step. Writing BPTT yourself shows exactly why plain RNNs suffer from vanishing and exploding gradients, a classic interview topic, and it is the same backward pass that autograd runs for you.

### Forward
\`\`\`text
h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b)        for t = 1..T, starting from h_0
\`\`\`

### Backward (BPTT)
Given \`dH = dL/dH_all\` of shape \`(N, T, H)\` (the loss may depend on every hidden state), walk the sequence **backwards**. The gradient reaching \`h_t\` has two parts: the direct one, \`dH[:, t]\`, and the one flowing back from \`h_{t+1}\`:
\`\`\`text
dh_next = 0
for t = T..1:
    dh   = dH[:, t] + dh_next                # direct + from the future
    da   = dh * (1 - h_t ** 2)               # through tanh (tanh' = 1 - tanh^2)
    dW_xh += x_t.T @ da                      # shared weights: ACCUMULATE over t
    dW_hh += h_{t-1}.T @ da
    db    += da.sum(axis=0)
    dX[:, t] = da @ W_xh.T
    dh_next  = da @ W_hh.T                   # flows into h_{t-1}
dh0 = dh_next
\`\`\`
The repeated multiplication by \`W_hh.T\` and \`(1 - h**2)\` is why gradients **vanish or explode** over long sequences.

### Inputs (batch first)
| Tensor | Shape | Meaning |
|---|---|---|
| \`X\` | \`(N, T, D)\` | N sequences of T steps with D features |
| \`h0\` | \`(N, H)\` | initial hidden state |
| \`W_xh\` | \`(D, H)\` | input-to-hidden weights, used as \`x @ W_xh\` |
| \`W_hh\` | \`(H, H)\` | hidden-to-hidden weights, used as \`h @ W_hh\` |
| \`b\` | \`(H,)\` | bias |
| \`H_all\` | \`(N, T, H)\` | output of \`rnn_forward\` (input to \`rnn_backward\`) |
| \`dH\` | \`(N, T, H)\` | upstream gradient \`dL/dH_all\` |

Layout note: this problem uses \`(in, out)\` weights and one bias. \`nn.RNN\` stores the transpose, \`weight_ih_l0\` of shape \`(H, D)\`, and has two biases (\`b_ih + b_hh\`).

### Expected return format
- \`rnn_forward\` returns \`H_all\`, shape \`(N, T, H)\`: \`H_all[:, t]\` is the state after reading step \`t\`. \`h_0\` is **not** included.
- \`rnn_backward\` returns a dictionary with these keys, each the same shape as the matching input:
  - \`'dX'\`: \`(N, T, D)\`
  - \`'dh0'\`: \`(N, H)\`
  - \`'dW_xh'\`: \`(D, H)\`
  - \`'dW_hh'\`: \`(H, H)\`
  - \`'db'\`: \`(H,)\`

### Edge cases and conventions
- \`T = 1\` works: one step, and \`dh0 = da @ W_hh.T\`.
- At \`t = 0\` the previous state is \`h0\`, not zeros.
- Recompute nothing: the tanh derivative uses the stored outputs \`H_all\`.

### Constraints
NumPy only. Loops over time are expected (the recurrence is sequential); vectorise over the batch.

### Follow-up
- Why does gradient clipping fix exploding but not vanishing gradients?
- What is truncated BPTT and what does it trade away?
`,
    examples: [
      {
        input: 'X = np.ones((1, 3, 1)), h0 = [[0.0]], W_xh = [[0.5]], W_hh = [[1.0]], b = [0.0]',
        output: '[[[0.462117], [0.74522], [0.846938]]]',
        explanation: 'h1 = tanh(0.5), h2 = tanh(0.5 + h1), h3 = tanh(0.5 + h2): the state accumulates evidence.',
      },
      {
        input: 'X: (2, 3, 4), h0: (2, 5), W_xh: (4, 5), W_hh: (5, 5); rnn_backward(...)',
        output: "{'dX': (2, 3, 4), 'dh0': (2, 5), 'dW_xh': (4, 5), 'dW_hh': (5, 5), 'db': (5,)}",
        explanation: 'Every gradient has the shape of the tensor it differentiates (shapes shown).',
      },
    ],
    starterCode: `import numpy as np

def rnn_forward(X, h0, W_xh, W_hh, b):
    """
    Run a vanilla RNN over a batch of sequences:
    h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b).

    Args:
        X: Inputs (N, T, D), batch first
        h0: Initial hidden state (N, H)
        W_xh: Input-to-hidden weights (D, H)
        W_hh: Hidden-to-hidden weights (H, H)
        b: Bias (H,)

    Returns:
        H_all: Hidden states for every step (N, T, H), h0 not included
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
        dict with 'dX' (N, T, D), 'dh0' (N, H), 'dW_xh' (D, H),
        'dW_hh' (H, H) and 'db' (H,)
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
        input: `(lambda: (X := np.array([[[1.0], [2.0]]]), h0 := np.array([[0.5]]), Wx := np.array([[0.3]]), Wh := np.array([[-0.7]]), b := np.array([0.1]), Hs := rnn_forward(X, h0, Wx, Wh, b), g := rnn_backward(X, h0, Wx, Wh, Hs, np.ones((1, 2, 1))), [round(float(g[k].sum()), 6) for k in ('dX', 'dh0', 'dW_xh', 'dW_hh', 'db')])[-1])()`,
        expected: '[0.359144, -0.374866, 1.858772, 0.300815, 1.197147]',
        hidden: true,
      },
      {
        id: '6',
        description: 'rnn_backward returns every key with the right shape',
        input: '(lambda: (X := np.random.randn(2, 3, 4), h0 := np.random.randn(2, 5), Wx := np.random.randn(4, 5), Wh := np.random.randn(5, 5), Hs := rnn_forward(X, h0, Wx, Wh, np.zeros(5)), {k: tuple(np.shape(v)) for k, v in rnn_backward(X, h0, Wx, Wh, Hs, np.ones_like(Hs)).items()})[-1])()',
        expected: "{'dX': (2, 3, 4), 'dh0': (2, 5), 'dW_xh': (4, 5), 'dW_hh': (5, 5), 'db': (5,)}",
        hidden: false,
      },
      {
        id: '7',
        description: 'A single step (T = 1) uses h0 and b',
        input: 'np.round(rnn_forward(np.array([[[1.0, -1.0]]]), np.array([[0.5]]), np.array([[0.3], [0.2]]), np.array([[0.4]]), np.array([0.1])), 6).tolist()',
        expected: '[[[0.379949]]]',
        hidden: true,
      },
    ],
    hints: [
      'Forward is a loop over time that reuses the same weights. Backward walks the same loop in reverse; at each step the gradient into h_t comes from two places.',
      'Forward: h = np.tanh(X[:, t] @ W_xh + h @ W_hh + b), collect each h and np.stack(hs, axis=1). Backward: zero-initialise every gradient and dh_next, then loop t from T-1 down to 0.',
      'da = (dH[:, t] + dh_next) * (1 - h_t ** 2); dW_xh += X[:, t].T @ da; dW_hh += h_prev.T @ da; db += da.sum(axis=0); dX[:, t] = da @ W_xh.T; dh_next = da @ W_hh.T. h_prev is H_all[:, t-1], or h0 when t == 0.',
      'Pitfalls: overwriting (=) instead of accumulating (+=) the weight gradients, forgetting dh_next in dh, and using zeros instead of h0 as the state before step 0.',
    ],
    solution: `import numpy as np

def rnn_forward(X, h0, W_xh, W_hh, b):
    """
    Run a vanilla RNN over a batch of sequences:
    h_t = tanh(x_t @ W_xh + h_{t-1} @ W_hh + b).

    Returns:
        H_all: Hidden states for every step (N, T, H), h0 not included
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

    Returns:
        dict with 'dX' (N, T, D), 'dh0' (N, H), 'dW_xh' (D, H),
        'dW_hh' (H, H) and 'db' (H,)
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
        dW_xh += X[:, t].T @ da            # shared weights: accumulate over time
        dW_hh += h_prev.T @ da
        db += da.sum(axis=0)
        dX[:, t] = da @ W_xh.T
        dh_next = da @ W_hh.T              # gradient flowing into h_{t-1}

    return {'dX': dX, 'dh0': dh_next, 'dW_xh': dW_xh, 'dW_hh': dW_hh, 'db': db}

# Forward and backward: time O(T * N * (D*H + H^2)), memory O(N * T * H) for the stored states.
`,
  },
  {
    id: 'lstm-cell',
    title: 'LSTM Cell',
    section: 'sequence-models',
    difficulty: 'medium',
    description: `
## LSTM Cell

### What you'll build
One time step of an LSTM, matching PyTorch's \`nn.LSTMCell\` exactly (same weight layout, same gate order).

### Background
The LSTM (Hochreiter & Schmidhuber, 1997) fixes the vanilla RNN's vanishing gradients with a separate **cell state** \`c\` that is updated *additively* and controlled by gates. When the forget gate is close to 1, \`dc_t / dc_{t-1} ≈ 1\`, so gradients flow back through \`c\` almost unchanged over hundreds of steps.

### Formula
\`\`\`text
gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh      # (N, 4H)
i, f, g, o = split(gates, 4, axis=-1)                   # each (N, H), in THIS order

i = sigmoid(i)        # input gate:  how much new content to write
f = sigmoid(f)        # forget gate: how much of the old cell to keep
g = tanh(g)           # candidate cell content, in (-1, 1)
o = sigmoid(o)        # output gate: how much of the cell to expose

c = f * c_prev + i * g
h = o * tanh(c)
\`\`\`

### Weight layout and gate order: \`i, f, g, o\`
The four gates are stacked along the **first** axis of each weight, in the order **i, f, g, o**, exactly like \`nn.LSTMCell.weight_ih\` / \`weight_hh\`:

| Rows of \`W_ih\`, \`W_hh\` (and entries of the biases) | Gate |
|---|---|
| \`0 : H\` | input gate \`i\` |
| \`H : 2H\` | forget gate \`f\` |
| \`2H : 3H\` | candidate \`g\` |
| \`3H : 4H\` | output gate \`o\` |

Weights are \`(out, in)\` (PyTorch convention), hence \`x @ W_ih.T\`. Keras also orders the gates \`i, f, c, o\` but stores kernels as \`(D, 4H)\`.

### Inputs
| Tensor | Shape |
|---|---|
| \`x\` | \`(N, D)\` |
| \`h_prev\`, \`c_prev\` | \`(N, H)\` |
| \`W_ih\` | \`(4H, D)\` |
| \`W_hh\` | \`(4H, H)\` |
| \`b_ih\`, \`b_hh\` | \`(4H,)\` |

### Expected return format
A tuple \`(h, c)\`: the new hidden state and the new cell state, each a float array of shape \`(N, H)\`, in that order.

### Edge cases and conventions
- Both biases are added (PyTorch keeps two; they are redundant but part of the layout).
- A \`sigmoid\` helper is provided. \`h\` always lies in \`(-1, 1)\`; \`c\` is unbounded.

### Constraints
NumPy only; vectorised over the batch (one matmul per weight, not one per gate).

### Follow-up
- How many parameters does \`nn.LSTMCell(D, H)\` have? (\`4(HD + H^2 + 2H)\`.)
- Why is the forget-gate bias often initialised to 1? What do peephole connections add?
`,
    examples: [
      {
        input: 'x = [[0.3, -0.1]], h_prev = [[0, 0]], c_prev = [[1.0, -2.0]], all weights and biases zero',
        output: '(array([[0.231059, -0.380797]]), array([[0.5, -1.0]]))',
        explanation: 'Every gate is sigmoid(0) = 0.5 and g = tanh(0) = 0, so c = 0.5 * c_prev and h = 0.5 * tanh(c).',
      },
      {
        input: 'D = H = 1, x = [[1.0]], h_prev = [[0.0]], c_prev = [[1.0]], W_ih = [[0], [2], [1], [0]], W_hh = 0, biases 0',
        output: '(array([[0.425752]]), array([[1.261594]]))',
        explanation: 'Pre-activations (i, f, g, o) = (0, 2, 1, 0): c = sigmoid(2) * 1 + 0.5 * tanh(1) = 1.2616, h = 0.5 * tanh(1.2616) = 0.4258.',
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
        W_ih: Input weights (4H, D), row blocks [i; f; g; o]
        W_hh: Hidden weights (4H, H), row blocks [i; f; g; o]
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
      {
        id: '5',
        description: 'Worked example: pre-activations (i, f, g, o) = (0, 2, 1, 0)',
        input: 'tuple(np.round(a, 6).tolist() for a in lstm_cell(np.array([[1.0]]), np.zeros((1, 1)), np.array([[1.0]]), np.array([[0.0], [2.0], [1.0], [0.0]]), np.zeros((4, 1)), np.zeros(4), np.zeros(4)))',
        expected: '([[0.425752]], [[1.261594]])',
        hidden: true,
      },
    ],
    hints: [
      'All four gates are linear functions of the same [x, h_prev]; compute them together, then split. The cell state is the "memory" and h is a gated, squashed view of it.',
      'One matmul per weight: gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh has shape (N, 4H). Split it into four (N, H) blocks.',
      'i, f, g, o = np.split(gates, 4, axis=-1); sigmoid for i, f, o and np.tanh for g; c = f * c_prev + i * g; h = o * np.tanh(c).',
      'The order is i, f, g, o (not i, f, o, g), the weights need .T, and h uses tanh of the NEW cell state c, not c_prev.',
    ],
    solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def lstm_cell(x, h_prev, c_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One LSTM step (gate order i, f, g, o, as in nn.LSTMCell).

    Returns:
        (h, c): new hidden and cell states, each (N, H)
    """
    gates = x @ W_ih.T + b_ih + h_prev @ W_hh.T + b_hh   # (N, 4H)
    i, f, g, o = np.split(gates, 4, axis=-1)             # row blocks i, f, g, o
    i, f, g, o = sigmoid(i), sigmoid(f), np.tanh(g), sigmoid(o)
    c = f * c_prev + i * g        # additive cell update: the gradient highway
    h = o * np.tanh(c)
    return h, c

# Time O(N * 4H * (D + H)), dominated by the two matmuls.
`,
  },
  {
    id: 'gru-cell',
    title: 'GRU Cell',
    section: 'sequence-models',
    difficulty: 'medium',
    description: `
## GRU Cell

### What you'll build
One time step of a Gated Recurrent Unit, matching PyTorch's \`nn.GRUCell\` exactly (weight layout, gate order and reset-gate placement).

### Background
The GRU (Cho et al., 2014) merges the LSTM's cell and hidden state into one vector and uses two gates instead of three. It has 3 weight blocks instead of 4 (25% fewer parameters) and usually trains about as well. Its update rule is a learned interpolation between the old state and a candidate.

### Formula
\`\`\`text
gi = x @ W_ih.T + b_ih              # (N, 3H), split into  i_r, i_z, i_n
gh = h_prev @ W_hh.T + b_hh         # (N, 3H), split into  h_r, h_z, h_n

r = sigmoid(i_r + h_r)              # reset gate
z = sigmoid(i_z + h_z)              # update gate
n = tanh(i_n + r * h_n)             # candidate state
h = (1 - z) * n + z * h_prev
\`\`\`

### Conventions to get right
- **Gate order \`r, z, n\`** along the first axis of the weights (rows \`0:H\`, \`H:2H\`, \`2H:3H\`), as in \`nn.GRUCell.weight_ih\` / \`weight_hh\`. Weights are \`(out, in)\`, hence \`.T\`.
- **The update gate \`z\` keeps the old state**: \`z = 1\` copies \`h_prev\`, \`z = 0\` takes the candidate \`n\`. Some papers swap the roles of \`z\` and \`1 - z\`; PyTorch uses the form above.
- **Reset gate placement**: \`r\` multiplies \`h_n = h_prev @ W_hn.T + b_hn\`, **including the bias \`b_hn\`**, *after* the matrix product. The original paper computes \`(r * h_prev) @ W_hn.T\` instead, which gives different numbers. Follow PyTorch. This is why the input and hidden projections must stay separate (you can't add \`gi + gh\` before splitting).

### Inputs
| Tensor | Shape |
|---|---|
| \`x\` | \`(N, D)\` |
| \`h_prev\` | \`(N, H)\` |
| \`W_ih\` | \`(3H, D)\` |
| \`W_hh\` | \`(3H, H)\` |
| \`b_ih\`, \`b_hh\` | \`(3H,)\` |

### Expected return format
The new hidden state \`h\`: a float array of shape \`(N, H)\`.

### Edge cases and conventions
- A \`sigmoid\` helper is provided. If \`|h_prev| < 1\`, the new \`h\` stays in \`(-1, 1)\` (a convex mix of values in that range).

### Constraints
NumPy only; vectorised over the batch (two matmuls total).

### Follow-up
- Count the parameters of \`nn.GRUCell(D, H)\` (\`3(HD + H^2 + 2H)\`) and compare with an LSTM.
- When would you pick a GRU over an LSTM, and vice versa?
`,
    examples: [
      {
        input: 'x = [[0.3, -0.1]], h_prev = [[1.0, -2.0]], all weights and biases zero',
        output: 'array([[0.5, -1.0]])',
        explanation: 'r = z = 0.5 and n = tanh(0) = 0, so h = 0.5 * 0 + 0.5 * h_prev.',
      },
      {
        input: 'D = H = 1, x = [[1.0]], h_prev = [[0.5]], W_ih = [[0], [1], [1]], W_hh = [[1], [0], [2]], biases 0',
        output: 'array([[0.614295]])',
        explanation: 'r = sigmoid(0 + 0.5) = 0.6225, z = sigmoid(1 + 0) = 0.7311, n = tanh(1 + 0.6225 * 1.0) = 0.9250, h = 0.2689 * 0.9250 + 0.7311 * 0.5.',
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
        W_ih: Input weights (3H, D), row blocks [r; z; n]
        W_hh: Hidden weights (3H, H), row blocks [r; z; n]
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
      {
        id: '5',
        description: 'Worked example with distinct r, z and n',
        input: 'np.round(gru_cell(np.array([[1.0]]), np.array([[0.5]]), np.array([[0.0], [1.0], [1.0]]), np.array([[1.0], [0.0], [2.0]]), np.zeros(3), np.zeros(3)), 6).tolist()',
        expected: '[[0.614295]]',
        hidden: true,
      },
    ],
    hints: [
      'Two gates decide how much of the old state to reuse (z) and how much of it feeds the candidate (r). The new state is an interpolation between h_prev and the candidate.',
      'Compute the input projection gi = x @ W_ih.T + b_ih and the hidden projection gh = h_prev @ W_hh.T + b_hh separately, then split each into three (N, H) blocks.',
      'i_r, i_z, i_n = np.split(gi, 3, axis=-1) (same for gh); r = sigmoid(i_r + h_r), z = sigmoid(i_z + h_z), n = np.tanh(i_n + r * h_n), h = (1 - z) * n + z * h_prev.',
      'Pitfalls: the order is r, z, n (not z, r, n); r multiplies h_n including b_hn; and z = 1 keeps h_prev, so it is (1 - z) * n + z * h_prev, not the reverse.',
    ],
    solution: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def gru_cell(x, h_prev, W_ih, W_hh, b_ih, b_hh):
    """
    One GRU step (gate order r, z, n, as in nn.GRUCell).

    Returns:
        h: New hidden state (N, H)
    """
    gi = x @ W_ih.T + b_ih                    # (N, 3H) input projection
    gh = h_prev @ W_hh.T + b_hh               # (N, 3H) hidden projection, kept separate
    i_r, i_z, i_n = np.split(gi, 3, axis=-1)
    h_r, h_z, h_n = np.split(gh, 3, axis=-1)

    r = sigmoid(i_r + h_r)
    z = sigmoid(i_z + h_z)
    n = np.tanh(i_n + r * h_n)                # reset gate applied after the matmul (PyTorch)
    return (1 - z) * n + z * h_prev           # z = 1 keeps the old state

# Time O(N * 3H * (D + H)), dominated by the two matmuls.
`,
  },
];
