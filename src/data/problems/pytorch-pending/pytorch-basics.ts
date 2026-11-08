// PyTorch tracks staged from the ML Coding Lab fork (src/data/problems/pytorch/pytorch-basics.ts),
// copied verbatim and keyed by problem id. Not imported anywhere yet: see README.md.
export const pytorchBasicsPyTorchPending: Record<string, unknown> = {
  'training-loop': {
    note: 'Use nn.Linear, nn.MSELoss and torch.optim.SGD, and let loss.backward() compute the gradients. Initialize the weight and bias to zeros with nn.init.zeros_ so the run is deterministic.',
    starterCode: `import torch
import torch.nn as nn

def train_linear_model(X, y, lr=0.1, epochs=100) -> dict:
    """
    Fit y ~ X @ w + b with full-batch gradient descent on the MSE.

    Args:
        X: Inputs of shape (N, d)
        y: Targets of shape (N,)
        lr: Learning rate
        epochs: Number of gradient steps

    Returns:
        dict with 'losses' (list of floats, loss before each step),
        'w' (tensor of shape (d,)) and 'b' (float)
    """
    model = nn.Linear(X.shape[1], 1)
    nn.init.zeros_(model.weight)
    nn.init.zeros_(model.bias)
    optimizer = torch.optim.SGD(model.parameters(), lr=lr)
    loss_fn = nn.MSELoss()
    losses = []
    # Your code here: zero_grad, forward, loss, backward, step
    pass
`,
    solution: `import torch
import torch.nn as nn

def train_linear_model(X, y, lr=0.1, epochs=100) -> dict:
    """
    Fit y ~ X @ w + b with full-batch gradient descent on the MSE.
    """
    model = nn.Linear(X.shape[1], 1)
    nn.init.zeros_(model.weight)
    nn.init.zeros_(model.bias)
    optimizer = torch.optim.SGD(model.parameters(), lr=lr)
    loss_fn = nn.MSELoss()

    losses = []
    for _ in range(epochs):
        optimizer.zero_grad()              # 1. clear old gradients
        pred = model(X).squeeze(-1)        # 2. forward: (N, 1) -> (N,)
        loss = loss_fn(pred, y)            # 3. loss
        loss.backward()                    # 4. backprop
        optimizer.step()                   # 5. update
        losses.append(loss.item())

    return {
        'losses': losses,
        'w': model.weight.detach().view(-1),
        'b': model.bias.item(),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'History length, first loss, strictly decreasing',
        input: "(lambda: (X := torch.randn(32, 2), y := X @ torch.tensor([2.0, -3.0]) + 0.5, r := train_linear_model(X, y, lr=0.1, epochs=50), len(r['losses']), bool(abs(r['losses'][0] - (y ** 2).mean().item()) < 1e-5), all(a > b for a, b in zip(r['losses'], r['losses'][1:])))[-3:])()",
        expected: '(50, True, True)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Converges to the true parameters',
        input: "(lambda: (X := torch.randn(64, 2), y := X @ torch.tensor([2.0, -3.0]) + 0.5, r := train_linear_model(X, y, lr=0.1, epochs=200), np.round(r['w'].double().numpy(), 3).tolist(), round(r['b'], 3), bool(r['losses'][-1] < 1e-6))[-3:])()",
        expected: '([2.0, -3.0], 0.5, True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Exact loss history and parameters on a tiny dataset',
        input: "(lambda: (r := train_linear_model(torch.tensor([[1.0], [2.0], [3.0]]), torch.tensor([2.0, 4.0, 6.5]), lr=0.05, epochs=4), [round(l, 4) for l in r['losses']], np.round(r['w'].double().numpy(), 4).tolist(), round(r['b'], 4))[1:])()",
        expected: '([20.75, 4.2638, 0.9907, 0.3383], [1.716], 0.6924)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Noisy data: converges to the least-squares solution',
        input: `(lambda: (
    X := torch.randn(100, 3), y := X @ torch.tensor([1.0, -2.0, 0.5]) - 1.0 + 0.3 * torch.randn(100),
    r := train_linear_model(X, y, lr=0.1, epochs=300),
    A := np.hstack([X.double().numpy(), np.ones((100, 1))]),
    sol := np.linalg.lstsq(A, y.double().numpy(), rcond=None)[0],
    bool(np.allclose(r['w'].double().numpy(), sol[:3], atol=1e-3)),
    bool(abs(r['b'] - sol[3]) < 1e-3)
)[-2:])()`,
        expected: '(True, True)',
        hidden: true,
      },
    ],
    hints: [
      'The five steps, in order: optimizer.zero_grad(), pred = model(X).squeeze(-1), loss = loss_fn(pred, y), loss.backward(), optimizer.step().',
      'nn.Linear returns shape (N, 1); squeeze the last dim so it matches y of shape (N,). Otherwise MSELoss broadcasts to (N, N).',
      'Record loss.item() (a Python float) each epoch; return model.weight.detach().view(-1) and model.bias.item().',
    ],
  },
  'dataloader-batching': {
    note: "Use torch.utils.data.TensorDataset and DataLoader with generator=torch.Generator().manual_seed(seed). The shuffle order then comes from torch's RNG rather than np.random.default_rng, so the tests check coverage, pairing and determinism instead of an exact order.",
    starterCode: `import torch
from torch.utils.data import TensorDataset, DataLoader

def make_batches(X, y, batch_size, shuffle=True, drop_last=False, seed=0) -> list:
    """
    Split (X, y) into minibatches for one epoch.

    Args:
        X: Inputs of shape (N, ...)
        y: Labels of shape (N,)
        batch_size: Samples per batch
        shuffle: Shuffle the samples (seeded with a torch.Generator)
        drop_last: Drop the final batch if it is smaller than batch_size
        seed: Seed for the shuffle

    Returns:
        List of (X_batch, y_batch) tuples
    """
    # Your code here
    pass
`,
    solution: `import torch
from torch.utils.data import TensorDataset, DataLoader

def make_batches(X, y, batch_size, shuffle=True, drop_last=False, seed=0) -> list:
    """
    Split (X, y) into minibatches for one epoch.
    """
    dataset = TensorDataset(X, y)
    generator = torch.Generator().manual_seed(seed)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=shuffle,
                        drop_last=drop_last, generator=generator)
    return [(xb, yb) for xb, yb in loader]
`,
    testCases: [
      {
        id: '1',
        description: 'No shuffle: consecutive batches, smaller last batch',
        input: '(lambda: [yb.tolist() for _, yb in make_batches(torch.arange(20).view(10, 2), torch.arange(10), 4, shuffle=False)])()',
        expected: '[[0, 1, 2, 3], [4, 5, 6, 7], [8, 9]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'drop_last=True: batch shapes',
        input: '(lambda: [list(xb.shape) for xb, _ in make_batches(torch.zeros(10, 3), torch.arange(10), 4, shuffle=True, drop_last=True)])()',
        expected: '[[4, 3], [4, 3]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Shuffled: each sample exactly once, rows paired with labels, batch sizes',
        input: '(lambda: (X := torch.arange(22).view(11, 2), bs := make_batches(X, torch.arange(11), 3, seed=7), sorted(torch.cat([yb for _, yb in bs]).tolist()) == list(range(11)), all(bool((xb[:, 0] == 2 * yb).all()) for xb, yb in bs), [len(yb) for _, yb in bs])[-3:])()',
        expected: '(True, True, [3, 3, 3, 2])',
        hidden: true,
      },
      {
        id: '4',
        description: 'Same seed gives the same batches, a different seed does not, and it really shuffles',
        input: '(lambda: (X := torch.randn(16, 2), y := torch.arange(16), a := [yb.tolist() for _, yb in make_batches(X, y, 4, seed=1)], b := [yb.tolist() for _, yb in make_batches(X, y, 4, seed=1)], c := [yb.tolist() for _, yb in make_batches(X, y, 4, seed=2)], a == b, a != c, sum(a, []) != list(range(16)))[-3:])()',
        expected: '(True, True, True)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Unshuffled float batches equal the matching slices; drop_last count',
        input: '(lambda: (X := torch.randn(12, 3), bs := make_batches(X, torch.arange(12), 5, shuffle=False), bool(torch.equal(bs[1][0], X[5:10])), bool(torch.equal(bs[2][0], X[10:12])), len(make_batches(X, torch.arange(12), 5, drop_last=True)))[-3:])()',
        expected: '(True, True, 2)',
        hidden: true,
      },
    ],
    hints: [
      'TensorDataset(X, y)[i] returns the pair (X[i], y[i]).',
      'DataLoader(dataset, batch_size=..., shuffle=..., drop_last=..., generator=torch.Generator().manual_seed(seed)) handles shuffling and batching.',
      'Iterating the loader yields [xb, yb] batches; collect them into a list of tuples.',
    ],
  },
};
