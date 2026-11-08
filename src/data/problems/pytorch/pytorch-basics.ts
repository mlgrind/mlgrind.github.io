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
};
