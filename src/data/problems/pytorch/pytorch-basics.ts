import { LanguageVariant } from '../../../types';

/**
 * PyTorch tracks for the problems in ../pytorch-basics.ts, keyed by problem id.
 * Code runs against the NumPy-backed torch shim (public/py/torch_shim.py).
 * Rules: docs/TORCH_TRACK.md.
 */
export const pytorchBasicsPyTorch: Record<string, LanguageVariant> = {
  'tensor-creation': {
    note: 'Use the real torch creation functions. torch.manual_seed(42) makes torch.randn reproducible.',
    starterCode: `import torch

def create_tensors() -> dict:
    """
    Create tensors using various methods.

    Returns:
        Dictionary with named tensors
    """
    torch.manual_seed(42)

    # Your code here
    pass
`,
    solution: `import torch

def create_tensors() -> dict:
    torch.manual_seed(42)

    return {
        'from_list': torch.tensor([1, 2, 3, 4], dtype=torch.float32),
        'zeros': torch.zeros(3, 4),
        'ones': torch.ones(2, 3),
        'randn': torch.randn(2, 3),
        'arange': torch.arange(10),
        'linspace': torch.linspace(0, 1, 5),
        'eye': torch.eye(4),
        'full': torch.full((2, 3), 7.0),
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Zeros shape',
        input: 'tuple(create_tensors()["zeros"].shape)',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Random tensor shape',
        input: 'tuple(create_tensors()["randn"].shape)',
        expected: '(2, 3)',
        hidden: false,
      },
      {
        id: '3',
        description: 'from_list is float32 with the right values',
        input: '(lambda t: (t.dtype == torch.float32, t.tolist()))(create_tensors()["from_list"])',
        expected: '(True, [1.0, 2.0, 3.0, 4.0])',
        hidden: true,
      },
      {
        id: '4',
        description: 'full, linspace and arange values',
        input: '(lambda r: (r["full"].tolist(), r["linspace"].tolist(), r["arange"].tolist()))(create_tensors())',
        expected: '([[7.0, 7.0, 7.0], [7.0, 7.0, 7.0]], [0.0, 0.25, 0.5, 0.75, 1.0], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])',
        hidden: true,
      },
      {
        id: '5',
        description: 'Seeded randn is reproducible; eye is identity',
        input: 'bool(torch.equal(create_tensors()["randn"], create_tensors()["randn"]) and torch.equal(create_tensors()["eye"], torch.eye(4)))',
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'torch.tensor(data, dtype=torch.float32) builds a tensor from a list',
      'torch.zeros(3, 4), torch.ones(2, 3), torch.randn(2, 3) take sizes as arguments',
      'torch.full((2, 3), 7.0) fills a tensor with one value',
    ],
  },

  'tensor-operations': {
    note: 'Use tensor methods with dim= (not axis=). torch.std is unbiased by default; pass unbiased=False to match np.std.',
    starterCode: `import torch

def tensor_ops(x: torch.Tensor, y: torch.Tensor) -> dict:
    """
    Perform common tensor operations.

    Args:
        x: First float tensor (2, 3)
        y: Second float tensor (2, 3)

    Returns:
        Dictionary with operation results
    """
    # Your code here
    pass
`,
    solution: `import torch

def tensor_ops(x: torch.Tensor, y: torch.Tensor) -> dict:
    return {
        # Arithmetic
        'add': x + y,
        'sub': x - y,
        'mul': x * y,
        'div': x / (y + 1e-8),
        'pow': x ** 2,

        # Reductions
        'sum_all': x.sum(),
        'sum_axis0': x.sum(dim=0),
        'sum_axis1': x.sum(dim=1),
        'mean': x.mean(),
        'std': x.std(unbiased=False),
        'max': x.max(),
        'argmax': x.argmax(),

        # Shape ops
        'reshape': x.reshape(3, 2),
        'flatten': x.flatten(),
        'unsqueeze': x.unsqueeze(0),            # (1, 2, 3)
        'squeeze': x.unsqueeze(0).squeeze(0),   # back to (2, 3)
        'transpose': x.T,
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Addition',
        input: 'tensor_ops(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.tensor([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]]))["add"]',
        expected: '[[2.0, 3.0, 4.0], [6.0, 7.0, 8.0]]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Mean computation',
        input: 'tensor_ops(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.tensor([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]]))["mean"]',
        expected: '3.5',
        hidden: false,
      },
      {
        id: '3',
        description: 'Reductions along dims, std and argmax',
        input: '(lambda r: (r["sum_axis0"].tolist(), r["sum_axis1"].tolist(), round(float(r["std"]), 4), int(r["argmax"])))(tensor_ops(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.tensor([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]])))',
        expected: '([5.0, 7.0, 9.0], [6.0, 15.0], 1.7078, 5)',
        hidden: true,
      },
      {
        id: '4',
        description: 'Shape operations',
        input: '(lambda r: (tuple(r["reshape"].shape), tuple(r["flatten"].shape), tuple(r["unsqueeze"].shape), tuple(r["squeeze"].shape), tuple(r["transpose"].shape)))(tensor_ops(torch.ones(2, 3), torch.ones(2, 3)))',
        expected: '((3, 2), (6,), (1, 2, 3), (2, 3), (3, 2))',
        hidden: true,
      },
      {
        id: '5',
        description: 'Reshape and division values',
        input: '(lambda r: (r["reshape"].tolist(), r["div"].round().tolist()))(tensor_ops(torch.tensor([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]), torch.tensor([[1.0, 1.0, 1.0], [2.0, 2.0, 2.0]])))',
        expected: '([[1.0, 2.0], [3.0, 4.0], [5.0, 6.0]], [[1.0, 2.0, 3.0], [2.0, 2.0, 3.0]])',
        hidden: true,
      },
    ],
    hints: [
      'Element-wise ops work directly: x + y, x * y',
      'Reductions take dim=: x.sum(dim=0)',
      'x.unsqueeze(0) adds a leading dimension; .squeeze(0) removes it',
    ],
  },

  'autograd-concepts': {
    note: 'Let autograd compute the gradients: create tensors with requires_grad=True, call .backward(), then read .grad.',
    starterCode: `import torch

def compute_gradients(x: float) -> dict:
    """
    Compute forward and backward pass for y = x^2 + 3x + 1 using autograd.

    Args:
        x: Input value

    Returns:
        Dictionary with 'y' (forward result) and 'grad' (dy/dx) as Python floats
    """
    # Your code here
    pass


def linear_layer_gradients(X: torch.Tensor, W: torch.Tensor, b: torch.Tensor,
                           grad_output: torch.Tensor) -> dict:
    """
    Compute gradients for a linear layer: Y = X @ W + b, using autograd.

    Args:
        X: Input (batch, in_features)
        W: Weights (in_features, out_features)
        b: Bias (out_features,)
        grad_output: Gradient from next layer (batch, out_features)

    Returns:
        Dictionary with gradients 'grad_X', 'grad_W' and 'grad_b'
    """
    # Your code here
    pass
`,
    solution: `import torch

def compute_gradients(x: float) -> dict:
    x = torch.tensor(float(x), requires_grad=True)

    # Forward pass builds the graph
    y = x ** 2 + 3 * x + 1

    # Backward pass fills x.grad with dy/dx
    y.backward()

    return {'y': y.item(), 'grad': x.grad.item()}


def linear_layer_gradients(X: torch.Tensor, W: torch.Tensor, b: torch.Tensor,
                           grad_output: torch.Tensor) -> dict:
    # Fresh leaf tensors that track gradients
    X = X.detach().clone().requires_grad_(True)
    W = W.detach().clone().requires_grad_(True)
    b = b.detach().clone().requires_grad_(True)

    # Forward
    Y = X @ W + b

    # Backward: Y is not a scalar, so pass the upstream gradient dL/dY
    Y.backward(grad_output)

    return {
        'grad_W': W.grad,
        'grad_b': b.grad,
        'grad_X': X.grad,
    }
`,
    testCases: [
      {
        id: '1',
        description: 'Simple gradient',
        input: 'compute_gradients(2.0)["grad"]',
        expected: '7.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'Forward pass result',
        input: 'compute_gradients(2.0)["y"]',
        expected: '11.0',
        hidden: false,
      },
      {
        id: '3',
        description: 'Linear layer: grad_W = X^T @ grad_output',
        input: 'linear_layer_gradients(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), torch.tensor([[1.0, 0.0, -1.0], [2.0, 1.0, 0.0]]), torch.zeros(3), torch.ones(2, 3))["grad_W"]',
        expected: '[[4.0, 4.0, 4.0], [6.0, 6.0, 6.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Gradient at another point',
        input: '(lambda r: (r["y"], r["grad"]))(compute_gradients(-1.5))',
        expected: '(-1.25, 0.0)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Linear layer: grad_b and grad_X',
        input: '(lambda r: (r["grad_b"].tolist(), r["grad_X"].tolist()))(linear_layer_gradients(torch.tensor([[1.0, 2.0], [3.0, 4.0]]), torch.tensor([[1.0, 0.0, -1.0], [2.0, 1.0, 0.0]]), torch.zeros(3), torch.ones(2, 3)))',
        expected: '([2.0, 2.0, 2.0], [[0.0, 3.0], [0.0, 3.0]])',
        hidden: true,
      },
      {
        id: '6',
        description: 'Linear layer gradients match the analytic formulas',
        input: `(lambda: (
    X := torch.randn(4, 3),
    W := torch.randn(3, 2),
    b := torch.randn(2),
    g := torch.randn(4, 2),
    r := linear_layer_gradients(X, W, b, g),
    bool(torch.allclose(r["grad_W"], X.T @ g, atol=1e-5)
         and torch.allclose(r["grad_X"], g @ W.T, atol=1e-5)
         and torch.allclose(r["grad_b"], g.sum(dim=0), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'torch.tensor(2.0, requires_grad=True) creates a leaf tensor that records operations',
      'Call y.backward() on a scalar; the gradient lands in x.grad',
      'For a non-scalar output Y, call Y.backward(grad_output)',
      'Use .item() to turn a 0-d tensor into a Python float',
    ],
  },

  'nn-modules': {
    note: 'Subclass nn.Module and register weights as nn.Parameter so parameters() finds them. Don\'t just wrap nn.Linear or nn.Sequential.',
    starterCode: `import torch
import torch.nn as nn

class Linear(nn.Module):
    """Linear layer: Y = X @ W + b"""

    def __init__(self, in_features: int, out_features: int):
        super().__init__()
        # Create self.W (in_features, out_features) and self.b (out_features,)
        # as nn.Parameter, with small random weights and zero bias
        # Your code here
        pass

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Your code here
        pass


class ReLU(nn.Module):
    """ReLU activation: max(0, x)"""

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Your code here
        pass


class Sequential(nn.Module):
    """Container for sequential layers"""

    def __init__(self, *layers):
        super().__init__()
        self.layers = nn.ModuleList(layers)  # registers the sub-modules

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Your code here
        pass


def create_mlp(input_dim: int, hidden_dim: int, output_dim: int):
    """Create a 2-layer MLP: Linear -> ReLU -> Linear"""
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn as nn

class Linear(nn.Module):
    def __init__(self, in_features: int, out_features: int):
        super().__init__()
        self.W = nn.Parameter(torch.randn(in_features, out_features) * 0.01)
        self.b = nn.Parameter(torch.zeros(out_features))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x @ self.W + self.b

    # parameters() is inherited from nn.Module: it yields W and b


class ReLU(nn.Module):
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return torch.clamp(x, min=0)


class Sequential(nn.Module):
    def __init__(self, *layers):
        super().__init__()
        self.layers = nn.ModuleList(layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for layer in self.layers:
            x = layer(x)  # calling the module runs its forward()
        return x


def create_mlp(input_dim: int, hidden_dim: int, output_dim: int):
    return Sequential(
        Linear(input_dim, hidden_dim),
        ReLU(),
        Linear(hidden_dim, output_dim),
    )
`,
    testCases: [
      {
        id: '1',
        description: 'Linear output shape',
        input: 'tuple(Linear(10, 5).forward(torch.randn(4, 10)).shape)',
        expected: '(4, 5)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Sequential forward',
        input: 'tuple(create_mlp(10, 20, 5)(torch.randn(4, 10)).shape)',
        expected: '(4, 5)',
        hidden: false,
      },
      {
        id: '3',
        description: 'ReLU values',
        input: 'ReLU()(torch.tensor([-2.0, 0.0, 1.5])).tolist()',
        expected: '[0.0, 0.0, 1.5]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Parameters are registered (10*20 + 20 + 20*5 + 5)',
        input: 'sum(p.numel() for p in create_mlp(10, 20, 5).parameters())',
        expected: '325',
        hidden: true,
      },
      {
        id: '5',
        description: 'Linear computes x @ W + b with zero bias at init',
        input: `(lambda: (
    layer := Linear(3, 2),
    x := torch.randn(4, 3),
    bool(torch.allclose(layer(x), x @ layer.W + layer.b) and torch.equal(layer.b.detach(), torch.zeros(2)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gradients reach every parameter',
        input: `(lambda: (
    model := create_mlp(4, 8, 2),
    model(torch.randn(3, 4)).sum().backward(),
    all(p.grad is not None for p in model.parameters())
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'self.W = nn.Parameter(torch.randn(in_features, out_features) * 0.01)',
      'ReLU: torch.clamp(x, min=0)',
      'Sequential.forward applies each layer in order: x = layer(x)',
      'nn.Module.parameters() finds every nn.Parameter, including those in sub-modules',
    ],
  },

  'loss-functions': {
    note: 'This is the PyTorch Basics section: use the built-in losses (F.softmax, F.cross_entropy, F.mse_loss, F.binary_cross_entropy). Return Python floats with .item().',
    starterCode: `import torch
import torch.nn.functional as F

def softmax(x: torch.Tensor) -> torch.Tensor:
    """Softmax over the last dimension."""
    # Your code here
    pass


def cross_entropy_loss(logits: torch.Tensor, targets: torch.Tensor) -> float:
    """
    Cross-entropy loss for classification.

    Args:
        logits: Raw scores (batch, num_classes)
        targets: Integer class labels (batch,)

    Returns:
        Scalar loss
    """
    # Your code here
    pass


def mse_loss(y_pred: torch.Tensor, y_true: torch.Tensor) -> float:
    """Mean squared error loss."""
    # Your code here
    pass


def binary_cross_entropy(y_pred: torch.Tensor, y_true: torch.Tensor) -> float:
    """Binary cross-entropy on probabilities."""
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def softmax(x: torch.Tensor) -> torch.Tensor:
    return F.softmax(x, dim=-1)


def cross_entropy_loss(logits: torch.Tensor, targets: torch.Tensor) -> float:
    # F.cross_entropy = log_softmax + negative log-likelihood, averaged over the batch
    return F.cross_entropy(logits, targets).item()


def mse_loss(y_pred: torch.Tensor, y_true: torch.Tensor) -> float:
    return F.mse_loss(y_pred, y_true).item()


def binary_cross_entropy(y_pred: torch.Tensor, y_true: torch.Tensor) -> float:
    return F.binary_cross_entropy(y_pred, y_true).item()
`,
    testCases: [
      {
        id: '1',
        description: 'Cross-entropy computation',
        input: 'round(float(cross_entropy_loss(torch.tensor([[2.0, 1.0, 0.1]]), torch.tensor([0]))), 4)',
        expected: '0.417',
        hidden: false,
      },
      {
        id: '2',
        description: 'MSE computation',
        input: 'float(mse_loss(torch.tensor([1.0, 2.0, 3.0]), torch.tensor([1.0, 2.0, 4.0])))',
        expected: '0.333333',
        hidden: false,
      },
      {
        id: '3',
        description: 'Softmax values',
        input: 'bool(torch.allclose(softmax(torch.tensor([[1.0, 2.0, 3.0], [0.0, 0.0, 0.0]])), torch.tensor([[0.090031, 0.244728, 0.665241], [1 / 3, 1 / 3, 1 / 3]]), atol=1e-5))',
        expected: 'True',
        hidden: true,
      },
      {
        id: '4',
        description: 'Cross-entropy averaged over a batch',
        input: 'round(float(cross_entropy_loss(torch.tensor([[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]]), torch.tensor([2, 0]))), 4)',
        expected: '1.4076',
        hidden: true,
      },
      {
        id: '5',
        description: 'Binary cross-entropy',
        input: 'round(float(binary_cross_entropy(torch.tensor([0.9, 0.1, 0.8]), torch.tensor([1.0, 0.0, 1.0]))), 4)',
        expected: '0.1446',
        hidden: true,
      },
    ],
    hints: [
      'F.softmax(x, dim=-1) normalizes over the last dimension',
      'F.cross_entropy takes raw logits and integer class indices (it applies log_softmax for you)',
      'F.binary_cross_entropy takes probabilities; F.binary_cross_entropy_with_logits takes raw scores',
      'Call .item() on a 0-d tensor to get a Python float',
    ],
  },
  // Ported with the new problems from the ML Coding Lab fork.
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
  // Tracks for existing problems that had no PyTorch track yet.
  'gelu-activation': {
    note: "Implement the tanh approximation with tensor ops (torch.tanh). Don't call F.gelu or nn.GELU: the hidden tests compare against them.",
    starterCode: `import math
import torch

def gelu(x: torch.Tensor) -> torch.Tensor:
    """
    Compute the GELU activation function (tanh approximation).

    Args:
        x: Input tensor of any shape

    Returns:
        GELU activation applied element-wise, same shape as input
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def gelu(x: torch.Tensor) -> torch.Tensor:
    # Same as F.gelu(x, approximate='tanh'); autograd differentiates it for free
    c = math.sqrt(2.0 / math.pi)
    return 0.5 * x * (1.0 + torch.tanh(c * (x + 0.044715 * x ** 3)))
`,
    testCases: [
      {
        id: '1',
        description: 'GELU of 1.0',
        input: 'round(gelu(torch.tensor([1.0]))[0].item(), 4)',
        expected: '0.8412',
        hidden: false,
      },
      {
        id: '2',
        description: 'GELU of -1, 0 and 1 (small negative output, zero at zero)',
        input: '[round(v, 4) for v in gelu(torch.tensor([-1.0, 0.0, 1.0])).tolist()]',
        expected: '[-0.1588, 0.0, 0.8412]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Shape preservation',
        input: 'tuple(gelu(torch.randn(3, 4)).shape)',
        expected: '(3, 4)',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.gelu(approximate="tanh") on random inputs',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(4, 5)).float(),
    bool(torch.allclose(gelu(x), torch.nn.functional.gelu(x, approximate="tanh"), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Autograd gradient matches the built-in GELU gradient',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(6)).float().requires_grad_(),
    gelu(x).sum().backward(),
    x2 := x.detach().clone().requires_grad_(),
    torch.nn.functional.gelu(x2, approximate="tanh").sum().backward(),
    bool(torch.allclose(x.grad, x2.grad, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Large negative input goes to (almost) zero from below',
        input: '[round(v, 4) for v in gelu(torch.tensor([-3.0, -0.5, 3.0])).tolist()]',
        expected: '[-0.0036, -0.1543, 2.9964]',
        hidden: true,
      },
    ],
    hints: [
      'math.sqrt(2 / math.pi) ≈ 0.7979',
      'torch.tanh works element-wise on tensors of any shape',
      'The formula is: 0.5 * x * (1 + tanh(sqrt(2/π) * (x + 0.044715 * x³)))',
      'You never write the derivative: autograd builds it from the ops you use',
    ],
  },
  'leaky-relu-swish': {
    note: "Implement both with tensor ops (torch.where, torch.sigmoid). Don't call F.leaky_relu, F.silu, nn.LeakyReLU or nn.SiLU.",
    starterCode: `import torch

def leaky_relu(x: torch.Tensor, alpha: float = 0.01) -> torch.Tensor:
    """
    Compute LeakyReLU activation.

    Args:
        x: Input tensor of any shape
        alpha: Slope for negative values (default 0.01)

    Returns:
        LeakyReLU applied element-wise
    """
    # Your code here
    pass


def swish(x: torch.Tensor, beta: float = 1.0) -> torch.Tensor:
    """
    Compute Swish activation: x * sigmoid(beta * x).

    Args:
        x: Input tensor of any shape
        beta: Scaling parameter (default 1.0)

    Returns:
        Swish applied element-wise
    """
    # Your code here
    pass
`,
    solution: `import torch

def leaky_relu(x: torch.Tensor, alpha: float = 0.01) -> torch.Tensor:
    return torch.where(x > 0, x, alpha * x)


def swish(x: torch.Tensor, beta: float = 1.0) -> torch.Tensor:
    # beta = 1 is SiLU (F.silu)
    return x * torch.sigmoid(beta * x)
`,
    testCases: [
      {
        id: '1',
        description: 'LeakyReLU keeps positives and scales negatives by alpha',
        input: '[round(v, 4) for v in leaky_relu(torch.tensor([-2.0, -1.0, 0.0, 1.0, 2.0])).tolist()]',
        expected: '[-0.02, -0.01, 0.0, 1.0, 2.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Swish of 1.0',
        input: 'round(swish(torch.tensor([1.0]))[0].item(), 4)',
        expected: '0.7311',
        hidden: false,
      },
      {
        id: '3',
        description: 'LeakyReLU with custom alpha',
        input: '[round(v, 4) for v in leaky_relu(torch.tensor([-1.0, -2.0]), 0.1).tolist()]',
        expected: '[-0.1, -0.2]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Match F.leaky_relu and F.silu on random inputs',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(3, 4)).float(),
    bool(torch.allclose(leaky_relu(x, 0.2), torch.nn.functional.leaky_relu(x, 0.2), atol=1e-6)
         and torch.allclose(swish(x), torch.nn.functional.silu(x), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Swish with beta=2',
        input: '[round(v, 4) for v in swish(torch.tensor([-1.0, 0.0, 2.0]), 2.0).tolist()]',
        expected: '[-0.1192, 0.0, 1.964]',
        hidden: true,
      },
      {
        id: '6',
        description: 'LeakyReLU gradient is alpha for negatives and 1 for positives',
        input: `(lambda: (
    x := torch.tensor([-2.0, 3.0], requires_grad=True),
    leaky_relu(x, 0.1).sum().backward(),
    [round(g, 4) for g in x.grad.tolist()]
)[-1])()`,
        expected: '[0.1, 1.0]',
        hidden: true,
      },
    ],
    hints: [
      'torch.where(x > 0, x, alpha * x) picks element-wise between the two branches',
      'torch.sigmoid(z) = 1 / (1 + exp(-z))',
      'Swish is x * torch.sigmoid(beta * x)',
    ],
  },
  'softmax-temperature': {
    note: "Implement softmax with tensor ops (subtract the max, torch.exp, divide by the sum). Don't call F.softmax or torch.softmax.",
    starterCode: `import torch

def softmax_temperature(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor:
    """
    Compute softmax with temperature scaling.

    Args:
        logits: Input logits tensor (any shape, softmax along the last dim)
        temperature: Temperature parameter (default 1.0)

    Returns:
        Probability distribution (sums to 1 along the last dim)
    """
    # Your code here
    pass
`,
    solution: `import torch

def softmax_temperature(logits: torch.Tensor, temperature: float = 1.0) -> torch.Tensor:
    scaled = logits / temperature
    # Subtracting the row max doesn't change the result but keeps exp() from overflowing
    scaled = scaled - scaled.max(dim=-1, keepdim=True).values
    exp = torch.exp(scaled)
    return exp / exp.sum(dim=-1, keepdim=True)
`,
    testCases: [
      {
        id: '1',
        description: 'Standard softmax at T=1',
        input: '[round(p, 4) for p in softmax_temperature(torch.tensor([2.0, 1.0, 0.1]), 1.0).tolist()]',
        expected: '[0.659, 0.2424, 0.0986]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Low temperature approaches one-hot',
        input: '(lambda p: (int(p.argmax()), bool(p[0] > 0.99)))(softmax_temperature(torch.tensor([2.0, 1.0, 0.1]), 0.01))',
        expected: '(0, True)',
        hidden: false,
      },
      {
        id: '3',
        description: 'High temperature approaches uniform',
        input: 'bool(torch.allclose(softmax_temperature(torch.tensor([2.0, 1.0, 0.1]), 100.0), torch.full((3,), 1 / 3), atol=0.01))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.softmax(logits / T) on a random batch',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(4, 6)).float(),
    bool(torch.allclose(softmax_temperature(x, 0.5), torch.nn.functional.softmax(x / 0.5, dim=-1), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Numerically stable for huge logits',
        input: '[round(p, 4) for p in softmax_temperature(torch.tensor([1000.0, 1001.0, 1002.0]), 0.5).tolist()]',
        expected: '[0.0159, 0.1173, 0.8668]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Softmax over the last dim of a 3D tensor',
        input: `(lambda: (
    p := softmax_temperature(torch.from_numpy(np.random.randn(2, 3, 5)).float(), 2.0),
    (tuple(p.shape), bool(torch.allclose(p.sum(dim=-1), torch.ones(2, 3), atol=1e-6)))
)[-1])()`,
        expected: '((2, 3, 5), True)',
        hidden: true,
      },
    ],
    hints: [
      'Divide by the temperature first: scaled = logits / temperature',
      'x.max(dim=-1, keepdim=True) returns (values, indices); use .values',
      'keepdim=True keeps the reduced dim so the subtraction and division broadcast',
    ],
  },
  rmsnorm: {
    note: "Implement RMSNorm with tensor ops. Don't call F.rms_norm or nn.RMSNorm: the hidden tests compare against them.",
    starterCode: `import torch

def rmsnorm(x: torch.Tensor, gamma: torch.Tensor, eps: float = 1e-6) -> torch.Tensor:
    """
    Apply RMS Normalization.

    Args:
        x: Input tensor of shape (..., features)
        gamma: Learnable scale parameter of shape (features,)
        eps: Small constant for numerical stability

    Returns:
        Normalized tensor, same shape as input
    """
    # Your code here
    pass
`,
    solution: `import torch

def rmsnorm(x: torch.Tensor, gamma: torch.Tensor, eps: float = 1e-6) -> torch.Tensor:
    # No mean subtraction: divide by the root mean square of the last dim
    rms = torch.sqrt(x.pow(2).mean(dim=-1, keepdim=True) + eps)
    return x / rms * gamma
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'tuple(rmsnorm(torch.randn(2, 4), torch.ones(4)).shape)',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Known values with gamma=1',
        input: '[[round(v, 4) for v in row] for row in rmsnorm(torch.tensor([[1.0, 2.0, 3.0]]), torch.ones(3)).tolist()]',
        expected: '[[0.4629, 0.9258, 1.3887]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma scales the output',
        input: 'bool(torch.allclose(rmsnorm(torch.tensor([[1.0, 2.0, 3.0]]), torch.full((3,), 2.0)), 2.0 * rmsnorm(torch.tensor([[1.0, 2.0, 3.0]]), torch.ones(3)), atol=1e-6))',
        expected: 'True',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.rms_norm on a random 3D batch (random gamma, default and large eps)',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(3, 5, 8)).float(),
    g := torch.from_numpy(np.random.randn(8)).float(),
    bool(torch.allclose(rmsnorm(x, g), torch.nn.functional.rms_norm(x, (8,), g, 1e-6), atol=1e-5)
         and torch.allclose(rmsnorm(x * 0.1, g, 0.5), torch.nn.functional.rms_norm(x * 0.1, (8,), g, 0.5), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradients w.r.t. x and gamma match F.rms_norm',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(4, 6)).float().requires_grad_(),
    g := torch.from_numpy(np.random.randn(6)).float().requires_grad_(),
    w := torch.from_numpy(np.random.randn(4, 6)).float(),
    (rmsnorm(x, g) * w).sum().backward(),
    x2 := x.detach().clone().requires_grad_(),
    g2 := g.detach().clone().requires_grad_(),
    (torch.nn.functional.rms_norm(x2, (6,), g2, 1e-6) * w).sum().backward(),
    bool(torch.allclose(x.grad, x2.grad, atol=1e-5) and torch.allclose(g.grad, g2.grad, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Each row normalized separately, without centering',
        input: '[[round(v, 4) for v in row] for row in rmsnorm(torch.tensor([[3.0, 4.0], [1.0, 1.0]]), torch.ones(2)).tolist()]',
        expected: '[[0.8485, 1.1314], [1.0, 1.0]]',
        hidden: true,
      },
    ],
    hints: [
      'rms = torch.sqrt(x.pow(2).mean(dim=-1, keepdim=True) + eps)',
      'No mean subtraction: that is the difference from LayerNorm',
      'gamma has shape (features,) and broadcasts over the leading dims',
    ],
  },
  'group-norm': {
    note: "Implement GroupNorm with reshape, mean and var. Don't call F.group_norm or nn.GroupNorm: the hidden tests compare against them.",
    starterCode: `import torch

def group_norm(x: torch.Tensor, num_groups: int, gamma: torch.Tensor, beta: torch.Tensor, eps: float = 1e-5) -> torch.Tensor:
    """
    Apply Group Normalization.

    Args:
        x: Input tensor of shape (N, C)
        num_groups: Number of groups to divide channels into
        gamma: Scale parameter of shape (C,)
        beta: Shift parameter of shape (C,)
        eps: Small constant for numerical stability

    Returns:
        Normalized tensor of shape (N, C)
    """
    # Your code here
    pass
`,
    solution: `import torch

def group_norm(x: torch.Tensor, num_groups: int, gamma: torch.Tensor, beta: torch.Tensor, eps: float = 1e-5) -> torch.Tensor:
    N, C = x.shape
    xg = x.reshape(N, num_groups, C // num_groups)
    mean = xg.mean(dim=-1, keepdim=True)
    var = xg.var(dim=-1, unbiased=False, keepdim=True)   # population variance, like torch's norms
    x_norm = ((xg - mean) / torch.sqrt(var + eps)).reshape(N, C)
    return x_norm * gamma + beta
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches input',
        input: 'tuple(group_norm(torch.randn(2, 4), 2, torch.ones(4), torch.zeros(4)).shape)',
        expected: '(2, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Two groups of two channels',
        input: '[[round(v, 4) for v in row] for row in group_norm(torch.tensor([[1.0, 2.0, 3.0, 5.0]]), 2, torch.ones(4), torch.zeros(4)).tolist()]',
        expected: '[[-1.0, 1.0, -1.0, 1.0]]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Gamma and beta scale and shift',
        input: '[[round(v, 4) for v in row] for row in group_norm(torch.tensor([[1.0, 2.0, 3.0, 5.0]]), 2, torch.full((4,), 2.0), torch.ones(4)).tolist()]',
        expected: '[[-1.0, 3.0, -1.0, 3.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.group_norm with random gamma and beta',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(4, 8)).float(),
    g := torch.from_numpy(np.random.randn(8)).float(),
    b := torch.from_numpy(np.random.randn(8)).float(),
    bool(torch.allclose(group_norm(x, 2, g, b), torch.nn.functional.group_norm(x, 2, g, b, 1e-5), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'One group is LayerNorm over the channels',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(3, 6)).float(),
    bool(torch.allclose(group_norm(x, 1, torch.ones(6), torch.zeros(6)), torch.nn.functional.layer_norm(x, (6,)), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gradients w.r.t. x, gamma and beta match F.group_norm',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(3, 6)).float().requires_grad_(),
    g := torch.from_numpy(np.random.randn(6)).float().requires_grad_(),
    b := torch.zeros(6, requires_grad=True),
    w := torch.from_numpy(np.random.randn(3, 6)).float(),
    (group_norm(x, 3, g, b) * w).sum().backward(),
    x2 := x.detach().clone().requires_grad_(),
    g2 := g.detach().clone().requires_grad_(),
    b2 := torch.zeros(6, requires_grad=True),
    (torch.nn.functional.group_norm(x2, 3, g2, b2, 1e-5) * w).sum().backward(),
    bool(torch.allclose(x.grad, x2.grad, atol=1e-4) and torch.allclose(g.grad, g2.grad, atol=1e-5)
         and torch.allclose(b.grad, b2.grad, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'x.reshape(N, num_groups, C // num_groups) puts each group on its own row',
      'Reduce over the last dim with keepdim=True; use var(..., unbiased=False)',
      'Reshape back to (N, C) before applying gamma and beta',
    ],
  },
  'adam-optimizer': {
    note: "Implement the Adam update with tensor ops. Don't use torch.optim.Adam: the hidden tests check your steps against it.",
    starterCode: `import torch

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    """
    Perform one step of the Adam optimizer.

    Args:
        params: Current parameters (torch.Tensor)
        grads: Current gradients (torch.Tensor, same shape as params)
        m: First moment estimate (torch.Tensor, same shape as params)
        v: Second moment estimate (torch.Tensor, same shape as params)
        t: Current timestep (int, starting from 1)
        lr: Learning rate
        beta1: First moment decay rate
        beta2: Second moment decay rate
        eps: Small constant for numerical stability

    Returns:
        Dictionary with 'params', 'm', 'v' (tensors)
    """
    # Your code here
    pass
`,
    solution: `import torch

def adam_step(params, grads, m, v, t, lr=0.001, beta1=0.9, beta2=0.999, eps=1e-8):
    # Optimizer updates are not part of the model: keep them out of the autograd graph
    with torch.no_grad():
        m = beta1 * m + (1 - beta1) * grads
        v = beta2 * v + (1 - beta2) * grads ** 2
        m_hat = m / (1 - beta1 ** t)
        v_hat = v / (1 - beta2 ** t)
        params = params - lr * m_hat / (torch.sqrt(v_hat) + eps)
    return {'params': params, 'm': m, 'v': v}
`,
    testCases: [
      {
        id: '1',
        description: 'First step moves each parameter by lr against its gradient',
        input: '(lambda r: [round(p, 6) for p in r["params"].tolist()])(adam_step(torch.tensor([1.0, 2.0]), torch.tensor([0.5, -0.3]), torch.zeros(2), torch.zeros(2), 1))',
        expected: '[0.999, 2.001]',
        hidden: false,
      },
      {
        id: '2',
        description: 'First and second moment updates',
        input: '(lambda r: (round(r["m"].item(), 4), round(r["v"].item(), 6)))(adam_step(torch.tensor([1.0]), torch.tensor([1.0]), torch.zeros(1), torch.zeros(1), 1))',
        expected: '(0.1, 0.001)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Output shapes preserved',
        input: '(lambda r: tuple(tuple(r[k].shape) for k in ("params", "m", "v")))(adam_step(torch.zeros(3, 4), torch.ones(3, 4), torch.zeros(3, 4), torch.zeros(3, 4), 1))',
        expected: '((3, 4), (3, 4), (3, 4))',
        hidden: false,
      },
      {
        id: '4',
        description: 'Five steps match torch.optim.Adam exactly',
        input: `(lambda: (
    p0 := torch.from_numpy(np.random.randn(3, 2)).float(),
    gs := [torch.from_numpy(np.random.randn(3, 2)).float() for _ in range(5)],
    p := torch.nn.Parameter(p0.clone()),
    opt := torch.optim.Adam([p], lr=0.1),
    [(opt.zero_grad(), (p * g).sum().backward(), opt.step()) for g in gs],
    state := {"params": p0.clone(), "m": torch.zeros(3, 2), "v": torch.zeros(3, 2)},
    [state.update(adam_step(state["params"], g, state["m"], state["v"], t, lr=0.1)) for t, g in enumerate(gs, 1)],
    bool(torch.allclose(state["params"], p.detach(), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Two steps with custom betas',
        input: `(lambda: (
    r1 := adam_step(torch.tensor([5.0, -1.0]), torch.tensor([1.0, 2.0]), torch.zeros(2), torch.zeros(2), 1, lr=0.01, beta1=0.8, beta2=0.99),
    r2 := adam_step(r1["params"], torch.tensor([-0.5, 2.0]), r1["m"], r1["v"], 2, lr=0.01, beta1=0.8, beta2=0.99),
    [round(p, 6) for p in r2["params"].tolist()]
)[-1])()`,
        expected: '[4.987888, -1.02]',
        hidden: true,
      },
      {
        id: '6',
        description: 'Bias correction: the first step size is lr regardless of gradient scale',
        input: '(lambda r: [round(p, 6) for p in r["params"].tolist()])(adam_step(torch.zeros(2), torch.tensor([300.0, -0.005]), torch.zeros(2), torch.zeros(2), 1))',
        expected: '[-0.001, 0.001]',
        hidden: true,
      },
    ],
    hints: [
      'm = beta1 * m + (1 - beta1) * grads; v = beta2 * v + (1 - beta2) * grads ** 2',
      'Bias correction divides by (1 - beta ** t)',
      'params - lr * m_hat / (torch.sqrt(v_hat) + eps)',
      'Real optimizers update under torch.no_grad() so the step itself is not recorded by autograd',
    ],
  },
  'sgd-momentum': {
    note: "Implement the momentum update with tensor ops. Don't use torch.optim.SGD: the hidden tests check your steps against it.",
    starterCode: `import torch

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    """
    Perform one step of SGD with momentum.

    Args:
        params: Current parameters (torch.Tensor)
        grads: Current gradients (torch.Tensor, same shape as params)
        velocity: Current velocity (torch.Tensor, same shape as params)
        lr: Learning rate
        momentum: Momentum coefficient

    Returns:
        Dictionary with 'params' and 'velocity' (tensors)
    """
    # Your code here
    pass
`,
    solution: `import torch

def sgd_momentum_step(params, grads, velocity, lr=0.01, momentum=0.9):
    with torch.no_grad():
        velocity = momentum * velocity + grads   # torch.optim.SGD calls this the momentum_buffer
        params = params - lr * velocity
    return {'params': params, 'velocity': velocity}
`,
    testCases: [
      {
        id: '1',
        description: 'Without momentum (momentum=0) is standard SGD',
        input: 'round(sgd_momentum_step(torch.tensor([1.0]), torch.tensor([2.0]), torch.zeros(1), lr=0.1, momentum=0.0)["params"].item(), 4)',
        expected: '0.8',
        hidden: false,
      },
      {
        id: '2',
        description: 'Velocity accumulates over two steps',
        input: `(lambda: (
    r1 := sgd_momentum_step(torch.tensor([1.0]), torch.tensor([1.0]), torch.zeros(1), lr=0.1, momentum=0.9),
    r2 := sgd_momentum_step(r1["params"], torch.tensor([1.0]), r1["velocity"], lr=0.1, momentum=0.9),
    (round(r1["velocity"].item(), 4), round(r2["velocity"].item(), 4), round(r2["params"].item(), 4))
)[-1])()`,
        expected: '(1.0, 1.9, 0.71)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Params move opposite to the gradient',
        input: '[round(p, 4) for p in sgd_momentum_step(torch.tensor([5.0, 3.0]), torch.tensor([1.0, -1.0]), torch.zeros(2), lr=0.1, momentum=0.9)["params"].tolist()]',
        expected: '[4.9, 3.1]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Five steps match torch.optim.SGD(momentum=0.9)',
        input: `(lambda: (
    p0 := torch.from_numpy(np.random.randn(4)).float(),
    gs := [torch.from_numpy(np.random.randn(4)).float() for _ in range(5)],
    p := torch.nn.Parameter(p0.clone()),
    opt := torch.optim.SGD([p], lr=0.05, momentum=0.9),
    [(opt.zero_grad(), (p * g).sum().backward(), opt.step()) for g in gs],
    state := {"params": p0.clone(), "velocity": torch.zeros(4)},
    [state.update(sgd_momentum_step(state["params"], g, state["velocity"], lr=0.05, momentum=0.9)) for g in gs],
    bool(torch.allclose(state["params"], p.detach(), atol=1e-6))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Velocity with existing momentum',
        input: '(lambda r: (round(r["velocity"].item(), 4), round(r["params"].item(), 4)))(sgd_momentum_step(torch.tensor([0.0]), torch.tensor([1.0]), torch.tensor([2.0]), lr=0.01, momentum=0.9))',
        expected: '(2.8, -0.028)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Shape preservation',
        input: '(lambda r: (tuple(r["params"].shape), tuple(r["velocity"].shape)))(sgd_momentum_step(torch.zeros(3, 4), torch.ones(3, 4), torch.zeros(3, 4), lr=0.01, momentum=0.9))',
        expected: '((3, 4), (3, 4))',
        hidden: true,
      },
    ],
    hints: [
      'Velocity update: v = momentum * v + grads',
      'Parameter update: params = params - lr * v',
      'With momentum=0 this is plain SGD',
    ],
  },
  'lr-scheduling': {
    note: 'Return a Python float (use math.cos). In a real training loop you plug this function into torch.optim.lr_scheduler.LambdaLR, which is what the hidden tests do.',
    starterCode: `import math
import torch

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    """
    Compute learning rate with linear warmup and cosine decay.

    Args:
        step: Current training step
        warmup_steps: Number of warmup steps
        total_steps: Total number of training steps
        base_lr: Peak learning rate (default 0.001)
        min_lr: Minimum learning rate (default 1e-6)

    Returns:
        Learning rate (float) for the given step
    """
    # Your code here
    pass
`,
    solution: `import math
import torch

def lr_schedule(step, warmup_steps, total_steps, base_lr=0.001, min_lr=1e-6):
    if step < warmup_steps:
        return base_lr * step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * progress))


# Usage with an optimizer: LambdaLR multiplies the optimizer's base lr by the factor
# scheduler = torch.optim.lr_scheduler.LambdaLR(
#     optimizer, lambda s: lr_schedule(s, warmup_steps, total_steps) / base_lr)
`,
    testCases: [
      {
        id: '1',
        description: 'LR at step 0 is 0',
        input: 'round(lr_schedule(0, 100, 1000, 0.001, 1e-6), 6)',
        expected: '0.0',
        hidden: false,
      },
      {
        id: '2',
        description: 'LR at warmup_steps equals base_lr',
        input: 'round(lr_schedule(100, 100, 1000, 0.001, 1e-6), 6)',
        expected: '0.001',
        hidden: false,
      },
      {
        id: '3',
        description: 'LR at total_steps equals min_lr',
        input: 'round(lr_schedule(1000, 100, 1000, 0.001, 1e-6), 6)',
        expected: '1e-06',
        hidden: false,
      },
      {
        id: '4',
        description: 'Warmup midpoint and decay midpoint',
        input: '(lambda: (round(lr_schedule(50, 100, 1000, 0.001, 1e-6), 8), round(lr_schedule(550, 100, 1000, 0.001, 1e-6), 8)))()',
        expected: '(0.0005, 0.0005005)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Drives torch.optim.lr_scheduler.LambdaLR step by step',
        input: `(lambda: (
    p := torch.nn.Parameter(torch.zeros(1)),
    opt := torch.optim.SGD([p], lr=0.01),
    sched := torch.optim.lr_scheduler.LambdaLR(opt, lambda s: lr_schedule(s, 10, 50, 0.01, 1e-4) / 0.01),
    lrs := [(opt.step(), sched.step(), opt.param_groups[0]["lr"])[-1] for _ in range(50)],
    bool(all(abs(lr - lr_schedule(s + 1, 10, 50, 0.01, 1e-4)) < 1e-12 for s, lr in enumerate(lrs)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Without warmup it matches CosineAnnealingLR',
        input: `(lambda: (
    p := torch.nn.Parameter(torch.zeros(1)),
    opt := torch.optim.SGD([p], lr=0.001),
    sched := torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=20, eta_min=1e-6),
    lrs := [(opt.step(), sched.step(), opt.param_groups[0]["lr"])[-1] for _ in range(20)],
    bool(all(abs(lr - lr_schedule(s + 1, 0, 20)) < 1e-9 for s, lr in enumerate(lrs)))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'During warmup (step < warmup_steps): base_lr * step / warmup_steps',
      'Then progress = (step - warmup_steps) / (total_steps - warmup_steps)',
      'Cosine decay: min_lr + 0.5 * (base_lr - min_lr) * (1 + math.cos(math.pi * progress))',
      'LambdaLR(optimizer, f) sets lr = initial_lr * f(step), so pass lr_schedule(...) / base_lr',
    ],
  },
  'gradient-accumulation': {
    note: 'PyTorch accumulates gradients for you: every backward() adds into .grad. The solution uses that, the way real accumulation loops do (loss / accumulation_steps, then backward() per micro-batch).',
    starterCode: `import torch

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    """
    Accumulate and average gradients from micro-batches.

    Args:
        micro_batches_grads: List of gradient tensors
        accumulation_steps: Number of micro-batches to accumulate

    Returns:
        Averaged gradient tensor
    """
    # Your code here
    pass
`,
    solution: `import torch

def gradient_accumulation(micro_batches_grads, accumulation_steps):
    # Stand-in parameter: the micro-batch "loss" (param * g).sum() has gradient g
    param = torch.zeros_like(micro_batches_grads[0], requires_grad=True)
    for g in micro_batches_grads[:accumulation_steps]:
        loss = (param * g).sum() / accumulation_steps   # scale so the accumulated sum is a mean
        loss.backward()                                  # adds into param.grad
    return param.grad
`,
    testCases: [
      {
        id: '1',
        description: 'Two micro-batches averaged',
        input: 'gradient_accumulation([torch.tensor([1.0, 2.0]), torch.tensor([3.0, 4.0])], 2).tolist()',
        expected: '[2.0, 3.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Single micro-batch returns itself',
        input: 'gradient_accumulation([torch.tensor([5.0, 6.0])], 1).tolist()',
        expected: '[5.0, 6.0]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Four micro-batches',
        input: 'gradient_accumulation([torch.tensor([1.0]), torch.tensor([2.0]), torch.tensor([3.0]), torch.tensor([4.0])], 4).tolist()',
        expected: '[2.5]',
        hidden: true,
      },
      {
        id: '4',
        description: 'Only the first accumulation_steps micro-batches count',
        input: 'gradient_accumulation([torch.tensor([1.0, 0.0]), torch.tensor([3.0, 2.0]), torch.tensor([100.0, 100.0])], 2).tolist()',
        expected: '[2.0, 1.0]',
        hidden: true,
      },
      {
        id: '5',
        description: 'Averaged micro-batch gradients equal the full-batch gradient of an nn.Linear',
        input: `(lambda: (
    model := torch.nn.Linear(3, 1),
    X := torch.from_numpy(np.random.randn(8, 3)).float(),
    y := torch.from_numpy(np.random.randn(8, 1)).float(),
    full := torch.autograd.grad(torch.nn.functional.mse_loss(model(X), y), model.weight)[0],
    micro := [torch.autograd.grad(torch.nn.functional.mse_loss(model(X[i:i + 2]), y[i:i + 2]), model.weight)[0] for i in range(0, 8, 2)],
    avg := gradient_accumulation(micro, 4),
    (tuple(avg.shape), bool(torch.allclose(avg, full, atol=1e-6)))
)[-1])()`,
        expected: '((1, 3), True)',
        hidden: true,
      },
    ],
    hints: [
      'backward() adds into .grad instead of overwriting it; that is why loops call optimizer.zero_grad()',
      'Divide each micro-batch loss by accumulation_steps so the accumulated sum is a mean',
      'A simpler equivalent: torch.stack(grads[:accumulation_steps]).sum(dim=0) / accumulation_steps',
    ],
  },
  'instance-norm': {
    note: "Implement instance norm with mean and var over the spatial dims. Don't call F.instance_norm or nn.InstanceNorm2d: the hidden tests compare against them.",
    starterCode: `import torch

def instance_norm(x, gamma, beta, eps=1e-5):
    """
    Instance normalization for 4D input.

    Args:
        x: Input (N, C, H, W)
        gamma: Scale parameter (C,)
        beta: Shift parameter (C,)
        eps: Numerical stability constant

    Returns:
        Normalized output (N, C, H, W)
    """
    # Your code here
    pass
`,
    solution: `import torch

def instance_norm(x, gamma, beta, eps=1e-5):
    # Statistics per sample and per channel, over H and W
    mean = x.mean(dim=(2, 3), keepdim=True)
    var = x.var(dim=(2, 3), unbiased=False, keepdim=True)
    x_norm = (x - mean) / torch.sqrt(var + eps)
    return gamma.view(1, -1, 1, 1) * x_norm + beta.view(1, -1, 1, 1)
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape preserved',
        input: 'tuple(instance_norm(torch.randn(2, 3, 4, 4), torch.ones(3), torch.zeros(3)).shape)',
        expected: '(2, 3, 4, 4)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Per-sample, per-channel mean near zero',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(2, 3, 8, 8)).float() * 3 + 1,
    out := instance_norm(x, torch.ones(3), torch.zeros(3)),
    bool(torch.allclose(out.mean(dim=(2, 3)), torch.zeros(2, 3), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Beta shifts each channel mean',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(2, 3, 4, 4)).float(),
    out := instance_norm(x, torch.ones(3), torch.tensor([1.0, 2.0, 3.0])),
    [[round(v, 4) for v in row] for row in out.mean(dim=(2, 3)).tolist()]
)[-1])()`,
        expected: '[[1.0, 2.0, 3.0], [1.0, 2.0, 3.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.instance_norm with random gamma and beta',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(2, 3, 5, 5)).float(),
    g := torch.from_numpy(np.random.randn(3)).float(),
    b := torch.from_numpy(np.random.randn(3)).float(),
    bool(torch.allclose(instance_norm(x, g, b), torch.nn.functional.instance_norm(x, weight=g, bias=b, eps=1e-5), atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Per-channel (biased) variance near 1',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(2, 3, 8, 8)).float() * 2,
    out := instance_norm(x, torch.ones(3), torch.zeros(3)),
    bool(torch.allclose(out.var(dim=(2, 3), unbiased=False), torch.ones(2, 3), atol=1e-3))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gradients w.r.t. x and gamma match F.instance_norm',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(2, 2, 3, 3)).float().requires_grad_(),
    g := torch.from_numpy(np.random.randn(2)).float().requires_grad_(),
    w := torch.from_numpy(np.random.randn(2, 2, 3, 3)).float(),
    (instance_norm(x, g, torch.zeros(2)) * w).sum().backward(),
    x2 := x.detach().clone().requires_grad_(),
    g2 := g.detach().clone().requires_grad_(),
    (torch.nn.functional.instance_norm(x2, weight=g2, bias=torch.zeros(2), eps=1e-5) * w).sum().backward(),
    bool(torch.allclose(x.grad, x2.grad, atol=1e-4) and torch.allclose(g.grad, g2.grad, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
    ],
    hints: [
      'Reduce over dim=(2, 3) with keepdim=True',
      'Use x.var(..., unbiased=False): normalization layers use the population variance',
      'gamma.view(1, -1, 1, 1) broadcasts the per-channel scale over N, H and W',
    ],
  },
  'vit-patch-embeddings': {
    note: "Extract patches with reshape/permute (or Tensor.unfold) instead of Python loops. Don't use nn.Conv2d: the hidden tests check that your result equals the conv formulation.",
    starterCode: `import torch

def patch_embed(image, patch_size, embed_dim, W_proj, cls_token, pos_embed):
    """
    Create ViT patch embeddings.

    Args:
        image: Input image (C, H, W)
        patch_size: Size of each square patch
        embed_dim: Dimension of embeddings
        W_proj: Projection matrix (C*patch_size*patch_size, embed_dim)
        cls_token: CLS token embedding (embed_dim,)
        pos_embed: Positional embeddings (num_patches+1, embed_dim)

    Returns:
        Embeddings (num_patches + 1, embed_dim)
    """
    # Your code here
    pass
`,
    solution: `import torch

def patch_embed(image, patch_size, embed_dim, W_proj, cls_token, pos_embed):
    C, H, W = image.shape
    P = patch_size
    patches = (image.reshape(C, H // P, P, W // P, P)
                    .permute(1, 3, 0, 2, 4)        # (rows, cols, C, P, P), patches in row-major order
                    .reshape(-1, C * P * P))       # one flattened (C, P, P) patch per row
    tokens = patches @ W_proj                       # (num_patches, embed_dim)
    tokens = torch.cat([cls_token.unsqueeze(0), tokens], dim=0)
    return tokens + pos_embed
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape: 4 patches + CLS',
        input: `(lambda: (
    img := torch.from_numpy(np.random.randn(3, 8, 8)).float(),
    W := torch.from_numpy(np.random.randn(3 * 4 * 4, 16)).float(),
    cls := torch.from_numpy(np.random.randn(16)).float(),
    pos := torch.from_numpy(np.random.randn(5, 16)).float(),
    tuple(patch_embed(img, 4, 16, W, cls, pos).shape)
)[-1])()`,
        expected: '(5, 16)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Correct patch count for a 16x16 image',
        input: `(lambda: (
    img := torch.from_numpy(np.random.randn(3, 16, 16)).float(),
    W := torch.from_numpy(np.random.randn(48, 32)).float(),
    cls := torch.from_numpy(np.random.randn(32)).float(),
    pos := torch.from_numpy(np.random.randn(17, 32)).float(),
    patch_embed(img, 4, 32, W, cls, pos).shape[0]
)[-1])()`,
        expected: '17',
        hidden: false,
      },
      {
        id: '3',
        description: 'CLS token comes first; a blank image only adds positions',
        input: `(lambda: (
    out := patch_embed(torch.zeros(1, 4, 4), 2, 3, torch.ones(4, 3), torch.tensor([1.0, 2.0, 3.0]), torch.full((5, 3), 0.5)),
    out.tolist()
)[-1])()`,
        expected: '[[1.5, 2.5, 3.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Equals the strided Conv2d formulation used by real ViTs',
        input: `(lambda: (
    img := torch.from_numpy(np.random.randn(3, 8, 8)).float(),
    W := torch.from_numpy(np.random.randn(48, 16)).float(),
    cls := torch.from_numpy(np.random.randn(16)).float(),
    pos := torch.from_numpy(np.random.randn(5, 16)).float(),
    conv := torch.nn.functional.conv2d(img.unsqueeze(0), W.T.reshape(16, 3, 4, 4), stride=4).flatten(2).transpose(1, 2)[0],
    ref := torch.cat([cls.unsqueeze(0), conv]) + pos,
    bool(torch.allclose(patch_embed(img, 4, 16, W, cls, pos), ref, atol=1e-4))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Patches are taken in row-major order',
        input: `(lambda: (
    img := torch.from_numpy(np.random.randn(2, 4, 4)).float(),
    W := torch.from_numpy(np.random.randn(8, 5)).float(),
    out := patch_embed(img, 2, 5, W, torch.zeros(5), torch.zeros(5, 5)),
    bool(torch.allclose(out[2], img[:, 0:2, 2:4].reshape(-1) @ W, atol=1e-5)
         and torch.allclose(out[3], img[:, 2:4, 0:2].reshape(-1) @ W, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Gradients reach W_proj, cls_token and pos_embed',
        input: `(lambda: (
    img := torch.from_numpy(np.random.randn(3, 8, 8)).float(),
    W := torch.from_numpy(np.random.randn(48, 16)).float().requires_grad_(),
    cls := torch.zeros(16, requires_grad=True),
    pos := torch.zeros(5, 16, requires_grad=True),
    patch_embed(img, 4, 16, W, cls, pos).sum().backward(),
    (bool(torch.equal(cls.grad, torch.ones(16))), bool(torch.equal(pos.grad, torch.ones(5, 16))), tuple(W.grad.shape))
)[-1])()`,
        expected: '(True, True, (48, 16))',
        hidden: true,
      },
    ],
    hints: [
      'image.reshape(C, H // P, P, W // P, P) splits both spatial dims into (patch index, offset)',
      'permute(1, 3, 0, 2, 4) moves the patch indices first; reshape(-1, C * P * P) flattens each patch',
      'torch.cat([cls_token.unsqueeze(0), tokens], dim=0) prepends the CLS token',
    ],
  },
  'cross-attention': {
    note: "Implement attention with matmul and softmax (F.softmax is fine). Don't call F.scaled_dot_product_attention or nn.MultiheadAttention: the hidden tests compare against them.",
    starterCode: `import math
import torch
import torch.nn.functional as F

def cross_attention(Q, K, V):
    """
    Cross-attention mechanism.

    Args:
        Q: Queries (seq_len_q, d_k)
        K: Keys (seq_len_kv, d_k)
        V: Values (seq_len_kv, d_v)

    Returns:
        output: (seq_len_q, d_v)
    """
    # Your code here
    pass
`,
    solution: `import math
import torch
import torch.nn.functional as F

def cross_attention(Q, K, V):
    d_k = Q.shape[-1]
    scores = Q @ K.transpose(-2, -1) / math.sqrt(d_k)   # (seq_q, seq_kv)
    weights = F.softmax(scores, dim=-1)                 # each query's weights over the keys sum to 1
    return weights @ V
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape matches (seq_q, d_v)',
        input: 'tuple(cross_attention(torch.randn(4, 8), torch.randn(6, 8), torch.randn(6, 16)).shape)',
        expected: '(4, 16)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Different Q and KV lengths',
        input: 'tuple(cross_attention(torch.randn(3, 8), torch.randn(10, 8), torch.randn(10, 8)).shape)',
        expected: '(3, 8)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Identical keys give every query the mean of V',
        input: `(lambda: (
    V := torch.tensor([[1.0, 0.0], [3.0, 2.0], [5.0, 4.0]]),
    [[round(v, 4) for v in row] for row in cross_attention(torch.from_numpy(np.random.randn(2, 4)).float(), torch.ones(3, 4), V).tolist()]
)[-1])()`,
        expected: '[[3.0, 2.0], [3.0, 2.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.scaled_dot_product_attention',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(4, 16)).float(),
    K := torch.from_numpy(np.random.randn(6, 16)).float(),
    V := torch.from_numpy(np.random.randn(6, 32)).float(),
    ref := torch.nn.functional.scaled_dot_product_attention(Q.unsqueeze(0), K.unsqueeze(0), V.unsqueeze(0))[0],
    bool(torch.allclose(cross_attention(Q, K, V), ref, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Gradients w.r.t. Q, K and V match the built-in',
        input: `(lambda: (
    Q := torch.from_numpy(np.random.randn(3, 4)).float().requires_grad_(),
    K := torch.from_numpy(np.random.randn(5, 4)).float().requires_grad_(),
    V := torch.from_numpy(np.random.randn(5, 2)).float().requires_grad_(),
    w := torch.from_numpy(np.random.randn(3, 2)).float(),
    (cross_attention(Q, K, V) * w).sum().backward(),
    Q2 := Q.detach().clone().requires_grad_(),
    K2 := K.detach().clone().requires_grad_(),
    V2 := V.detach().clone().requires_grad_(),
    (torch.nn.functional.scaled_dot_product_attention(Q2.unsqueeze(0), K2.unsqueeze(0), V2.unsqueeze(0))[0] * w).sum().backward(),
    bool(all(torch.allclose(a.grad, b.grad, atol=1e-5) for a, b in ((Q, Q2), (K, K2), (V, V2))))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Single query: known weights',
        input: '[[round(v, 4) for v in row] for row in cross_attention(torch.tensor([[2.0, 0.0]]), torch.tensor([[1.0, 0.0], [0.0, 1.0]]), torch.tensor([[1.0, 0.0], [0.0, 1.0]])).tolist()]',
        expected: '[[0.8044, 0.1956]]',
        hidden: true,
      },
    ],
    hints: [
      'scores = Q @ K.T / math.sqrt(d_k), shape (seq_q, seq_kv)',
      'F.softmax(scores, dim=-1) normalizes over the keys',
      'weights @ V gives one d_v vector per query',
    ],
  },
  'depthwise-separable-conv': {
    note: "Implement both convolutions with tensor ops (Tensor.unfold + torch.einsum, or loops). Don't use F.conv2d or nn.Conv2d: the hidden tests compare against them (depthwise = conv2d with groups=C).",
    starterCode: `import torch

def depthwise_conv(x, kernel):
    """
    Depthwise convolution.

    Args:
        x: Input (C, H, W)
        kernel: Filters (C, kH, kW)

    Returns:
        Output (C, H-kH+1, W-kW+1)
    """
    # Your code here
    pass

def pointwise_conv(x, kernel):
    """
    Pointwise (1x1) convolution.

    Args:
        x: Input (C_in, H, W)
        kernel: Filters (C_out, C_in, 1, 1)

    Returns:
        Output (C_out, H, W)
    """
    # Your code here
    pass
`,
    solution: `import torch

def depthwise_conv(x, kernel):
    C, kH, kW = kernel.shape
    # (C, out_H, out_W, kH, kW): every kH x kW window of every channel
    windows = x.unfold(1, kH, 1).unfold(2, kW, 1)
    # Each channel only meets its own filter
    return torch.einsum('chwij,cij->chw', windows, kernel)

def pointwise_conv(x, kernel):
    # A 1x1 conv is a linear map over channels, applied at every pixel
    return torch.einsum('oc,chw->ohw', kernel[:, :, 0, 0], x)
`,
    testCases: [
      {
        id: '1',
        description: 'Depthwise output shape',
        input: 'tuple(depthwise_conv(torch.randn(3, 8, 8), torch.randn(3, 3, 3)).shape)',
        expected: '(3, 6, 6)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Pointwise output shape',
        input: 'tuple(pointwise_conv(torch.randn(3, 6, 6), torch.randn(16, 3, 1, 1)).shape)',
        expected: '(16, 6, 6)',
        hidden: false,
      },
      {
        id: '3',
        description: 'Depthwise known values',
        input: 'depthwise_conv(torch.ones(1, 3, 3), torch.ones(1, 2, 2)).tolist()',
        expected: '[[[4.0, 4.0], [4.0, 4.0]]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Depthwise matches F.conv2d with groups=C',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(4, 7, 6)).float(),
    k := torch.from_numpy(np.random.randn(4, 3, 2)).float(),
    ref := torch.nn.functional.conv2d(x.unsqueeze(0), k.unsqueeze(1), groups=4)[0],
    bool(torch.allclose(depthwise_conv(x, k), ref, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Pointwise matches F.conv2d with a 1x1 kernel',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(3, 5, 5)).float(),
    k := torch.from_numpy(np.random.randn(8, 3, 1, 1)).float(),
    bool(torch.allclose(pointwise_conv(x, k), torch.nn.functional.conv2d(x.unsqueeze(0), k)[0], atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '6',
        description: 'Depthwise on a ramp image (cross-correlation, no kernel flip)',
        input: 'depthwise_conv(torch.arange(16.0).reshape(1, 4, 4), torch.tensor([[[1.0, 0.0], [0.0, -2.0]]])).tolist()',
        expected: '[[[-10.0, -11.0, -12.0], [-14.0, -15.0, -16.0], [-18.0, -19.0, -20.0]]]',
        hidden: true,
      },
    ],
    hints: [
      'x.unfold(1, kH, 1).unfold(2, kW, 1) gives a (C, out_H, out_W, kH, kW) view of all windows',
      "torch.einsum('chwij,cij->chw', windows, kernel) multiplies each window by its channel's filter and sums",
      "Pointwise: torch.einsum('oc,chw->ohw', kernel[:, :, 0, 0], x)",
    ],
  },
  'label-smoothing': {
    note: "Implement the smoothed targets yourself (F.log_softmax and F.one_hot are fine). Don't use F.cross_entropy(..., label_smoothing=...) or nn.CrossEntropyLoss: the hidden tests compare against them. Return a Python float.",
    starterCode: `import torch
import torch.nn.functional as F

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    """
    Cross-entropy loss with label smoothing.

    Args:
        logits: Raw scores (batch, num_classes)
        targets: Integer labels (batch,)
        num_classes: Total classes
        smoothing: Epsilon

    Returns:
        Scalar loss (float)
    """
    # Your code here
    pass
`,
    solution: `import torch
import torch.nn.functional as F

def label_smoothing_loss(logits, targets, num_classes, smoothing=0.1):
    log_probs = F.log_softmax(logits, dim=-1)               # stable log(softmax)
    one_hot = F.one_hot(targets, num_classes).float()
    smooth = (1 - smoothing) * one_hot + smoothing / num_classes
    loss = -(smooth * log_probs).sum(dim=-1)                 # per-sample cross-entropy
    return loss.mean().item()
`,
    testCases: [
      {
        id: '1',
        description: 'Smoothing=0 equals standard cross-entropy',
        input: 'round(label_smoothing_loss(torch.tensor([[2.0, 1.0, 0.1]]), torch.tensor([0]), 3, 0.0), 4)',
        expected: '0.417',
        hidden: false,
      },
      {
        id: '2',
        description: 'Smoothing increases the loss of a confident correct prediction',
        input: `(lambda: (
    logits := torch.tensor([[5.0, 0.0, 0.0]]),
    targets := torch.tensor([0]),
    bool(label_smoothing_loss(logits, targets, 3, 0.1) > label_smoothing_loss(logits, targets, 3, 0.0))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Smoothed loss value',
        input: 'round(label_smoothing_loss(torch.tensor([[2.0, 1.0, 0.1]]), torch.tensor([0]), 3, 0.1), 4)',
        expected: '0.5137',
        hidden: false,
      },
      {
        id: '4',
        description: 'Matches F.cross_entropy(label_smoothing=0.2) on a random batch',
        input: `(lambda: (
    logits := torch.from_numpy(np.random.randn(5, 4)).float(),
    targets := torch.tensor([0, 3, 1, 2, 3]),
    abs(label_smoothing_loss(logits, targets, 4, 0.2) - torch.nn.functional.cross_entropy(logits, targets, label_smoothing=0.2).item()) < 1e-5
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'Returns a Python float',
        input: 'type(label_smoothing_loss(torch.tensor([[1.0, 2.0]]), torch.tensor([0]), 2, 0.1)).__name__',
        expected: 'float',
        hidden: true,
      },
      {
        id: '6',
        description: 'Batch of two samples',
        input: 'round(label_smoothing_loss(torch.tensor([[2.0, 1.0], [1.0, 2.0]]), torch.tensor([0, 1]), 2, 0.1), 4)',
        expected: '0.3633',
        hidden: true,
      },
    ],
    hints: [
      'F.log_softmax(logits, dim=-1) is the stable way to get log-probabilities',
      'F.one_hot(targets, num_classes).float() builds the hard targets',
      'smooth = (1 - eps) * one_hot + eps / num_classes; loss = -(smooth * log_probs).sum(-1).mean()',
      'Return loss.item() so the result is a Python float',
    ],
  },
  'lora-adapter': {
    note: "Use plain matmuls. Compute (x @ A) @ B rather than materializing A @ B: that is what keeps LoRA cheap. The hidden tests also check that autograd trains only A and B when W is frozen.",
    starterCode: `import torch

def lora_forward(x, W, A, B, alpha, r):
    """
    LoRA forward pass.

    Args:
        x: Input (batch, in_features)
        W: Frozen weights (in_features, out_features)
        A: Down-projection (in_features, r)
        B: Up-projection (r, out_features)
        alpha: Scaling factor
        r: Rank

    Returns:
        Output (batch, out_features)
    """
    # Your code here
    pass
`,
    solution: `import torch

def lora_forward(x, W, A, B, alpha, r):
    base = x @ W                          # frozen pretrained path
    update = (x @ A) @ B * (alpha / r)    # low-rank path, never builds the (in, out) matrix A @ B
    return base + update
`,
    testCases: [
      {
        id: '1',
        description: 'Output shape correct',
        input: 'tuple(lora_forward(torch.randn(2, 16), torch.randn(16, 16), torch.randn(16, 4), torch.randn(4, 16), 8, 4).shape)',
        expected: '(2, 16)',
        hidden: false,
      },
      {
        id: '2',
        description: 'Alpha=0 gives the base output',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(2, 8)).float(),
    W := torch.from_numpy(np.random.randn(8, 8)).float(),
    A := torch.from_numpy(np.random.randn(8, 2)).float(),
    B := torch.from_numpy(np.random.randn(2, 8)).float(),
    bool(torch.allclose(lora_forward(x, W, A, B, 0, 2), x @ W, atol=1e-5))
)[-1])()`,
        expected: 'True',
        hidden: false,
      },
      {
        id: '3',
        description: 'Known values: base + (alpha / r) * x @ A @ B',
        input: 'lora_forward(torch.tensor([[1.0, 2.0]]), torch.eye(2), torch.tensor([[1.0], [1.0]]), torch.tensor([[1.0, 0.0]]), 2, 1).tolist()',
        expected: '[[7.0, 2.0]]',
        hidden: false,
      },
      {
        id: '4',
        description: 'Equals a forward pass with the merged weight W + (alpha / r) * A @ B',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(3, 6)).float(),
    W := torch.from_numpy(np.random.randn(6, 5)).float(),
    A := torch.from_numpy(np.random.randn(6, 2)).float(),
    B := torch.from_numpy(np.random.randn(2, 5)).float(),
    bool(torch.allclose(lora_forward(x, W, A, B, 4, 2), x @ (W + 2.0 * A @ B), atol=1e-4))
)[-1])()`,
        expected: 'True',
        hidden: true,
      },
      {
        id: '5',
        description: 'With W frozen, autograd trains only A and B, with the right gradients',
        input: `(lambda: (
    x := torch.from_numpy(np.random.randn(4, 6)).float(),
    W := torch.from_numpy(np.random.randn(6, 3)).float(),
    A := torch.nn.Parameter(torch.from_numpy(np.random.randn(6, 2)).float()),
    B := torch.nn.Parameter(torch.from_numpy(np.random.randn(2, 3)).float()),
    lora_forward(x, W, A, B, 8, 2).sum().backward(),
    g := torch.ones(4, 3),
    (W.grad is None,
     bool(torch.allclose(B.grad, 4.0 * (x @ A).detach().T @ g, atol=1e-4)),
     bool(torch.allclose(A.grad, 4.0 * x.T @ g @ B.detach().T, atol=1e-4)))
)[-1])()`,
        expected: '(True, True, True)',
        hidden: true,
      },
      {
        id: '6',
        description: 'Different input/output dims',
        input: 'tuple(lora_forward(torch.randn(3, 64), torch.randn(64, 32), torch.randn(64, 4), torch.randn(4, 32), 8, 4).shape)',
        expected: '(3, 32)',
        hidden: true,
      },
    ],
    hints: [
      'Base: x @ W',
      'LoRA path: (alpha / r) * (x @ A) @ B',
      'In an nn.Module you would store W with requires_grad=False and A, B as nn.Parameter (B initialized to zeros)',
    ],
  },
  'gradient-checkpointing': {
    note: "torch.utils.checkpoint isn't available in the browser, so you build the idea yourself: run the forward under torch.no_grad() so autograd keeps no intermediate activations, save only the checkpoints (detached), and recompute a segment with autograd enabled when you need it.",
    starterCode: `import torch

def checkpoint_forward(layers, x, checkpoint_indices):
    """
    Forward pass with selective activation saving.

    Args:
        layers: List of layers (callables or nn.Modules)
        x: Input tensor
        checkpoint_indices: Layer indices to save

    Returns:
        output: Final output (no autograd graph attached)
        saved: Dict mapping index -> detached activation (-1 for input)
    """
    # Your code here
    pass

def checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx):
    """
    Recompute activation at layer_idx from nearest prior checkpoint.

    Args:
        layers: List of layers (callables or nn.Modules)
        saved_activations: Dict of saved activations
        checkpoint_indices: Saved indices
        layer_idx: Target layer

    Returns:
        Activation at layer_idx (recomputed with autograd enabled)
    """
    # Your code here
    pass
`,
    solution: `import torch

def checkpoint_forward(layers, x, checkpoint_indices):
    saved = {-1: x.detach().clone()}
    # No graph is recorded, so every intermediate activation is freed as soon as
    # the next layer has used it; only the checkpoints survive
    with torch.no_grad():
        activation = x
        for i, layer in enumerate(layers):
            activation = layer(activation)
            if i in checkpoint_indices:
                saved[i] = activation.clone()
    return activation, saved

def checkpoint_recompute(layers, saved_activations, checkpoint_indices, layer_idx):
    # Restart from the nearest saved activation before layer_idx
    start = max(k for k in saved_activations if k < layer_idx)
    activation = saved_activations[start]
    # This time autograd records the segment, so backward() can run through it
    with torch.enable_grad():
        for i in range(start + 1, layer_idx + 1):
            activation = layers[i](activation)
    return activation
`,
    testCases: [
      {
        id: '1',
        description: 'Output matches a regular forward pass',
        input: `(lambda: (
    layers := [lambda t: t * 2, lambda t: t + 1, lambda t: t * 3],
    result := checkpoint_forward(layers, torch.tensor([1.0]), [1]),
    result[0].tolist()
)[-1])()`,
        expected: '[9.0]',
        hidden: false,
      },
      {
        id: '2',
        description: 'Only the input and the checkpoint activations are saved',
        input: `(lambda: (
    layers := [lambda t: t * 2, lambda t: t + 1, lambda t: t * 3, lambda t: t - 1],
    result := checkpoint_forward(layers, torch.tensor([1.0]), [1, 3]),
    sorted(result[1].keys())
)[-1])()`,
        expected: '[-1, 1, 3]',
        hidden: false,
      },
      {
        id: '3',
        description: 'Recompute gives the correct activation',
        input: `(lambda: (
    layers := [lambda t: t * 2, lambda t: t + 1, lambda t: t * 3],
    result := checkpoint_forward(layers, torch.tensor([1.0]), [0]),
    checkpoint_recompute(layers, result[1], [0], 1).tolist()
)[-1])()`,
        expected: '[3.0]',
        hidden: true,
      },
      {
        id: '4',
        description: 'No autograd graph is kept by the forward pass, even for trainable layers',
        input: `(lambda: (
    layers := [torch.nn.Linear(4, 4), torch.nn.Tanh(), torch.nn.Linear(4, 4)],
    x := torch.from_numpy(np.random.randn(2, 4)).float().requires_grad_(),
    result := checkpoint_forward(layers, x, []),
    (sorted(result[1].keys()), result[0].requires_grad, any(t.requires_grad for t in result[1].values()))
)[-1])()`,
        expected: '([-1], False, False)',
        hidden: true,
      },
      {
        id: '5',
        description: 'Recompute only runs the layers after the nearest checkpoint',
        input: `(lambda: (
    calls := [],
    layers := [(lambda i: (lambda t: (calls.append(i), t + i)[-1]))(i) for i in range(6)],
    result := checkpoint_forward(layers, torch.zeros(1), [1, 3]),
    calls.clear(),
    out := checkpoint_recompute(layers, result[1], [1, 3], 5),
    (calls, out.tolist())
)[-1])()`,
        expected: '([4, 5], [15.0])',
        hidden: true,
      },
      {
        id: '6',
        description: 'Backward through a recomputed segment gives the same gradients as a full forward',
        input: `(lambda: (
    layers := torch.nn.ModuleList([torch.nn.Linear(4, 4), torch.nn.Tanh(), torch.nn.Linear(4, 4), torch.nn.Tanh(), torch.nn.Linear(4, 2)]),
    x := torch.from_numpy(np.random.randn(3, 4)).float(),
    out := x,
    [out := layer(out) for layer in layers],
    out.sum().backward(),
    ref := [layers[2].weight.grad.clone(), layers[4].weight.grad.clone()],
    [setattr(p, "grad", None) for p in layers.parameters()],
    result := checkpoint_forward(layers, x, [1]),
    recomputed := checkpoint_recompute(layers, result[1], [1], 4),
    recomputed.sum().backward(),
    (bool(torch.allclose(recomputed, result[0], atol=1e-6)),
     bool(torch.allclose(layers[2].weight.grad, ref[0], atol=1e-5)),
     bool(torch.allclose(layers[4].weight.grad, ref[1], atol=1e-5)),
     layers[0].weight.grad is None)
)[-1])()`,
        expected: '(True, True, True, True)',
        hidden: true,
      },
    ],
    hints: [
      'Always save the input at index -1 (x.detach().clone())',
      'Wrap the forward loop in torch.no_grad(): no graph means no stored activations',
      'Recompute: start from max(k for k in saved if k < layer_idx) and run the next layers under torch.enable_grad()',
      'This is what torch.utils.checkpoint does during backward()',
    ],
  },
};
